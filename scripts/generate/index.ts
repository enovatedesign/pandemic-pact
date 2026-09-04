import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import prepareHomepageTotals from './prepare-homepage-totals'
import prepareIndividualGrantFiles from './prepare-individual-grant-files'
import prepareVisualisePageGrantsFile from './prepare-visualise-page-grants-file'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareMap from './prepare-map'
import prepareSearch from './prepare-search'
import prepareRrna from './prepare-rrna-data'
import prepareRrnaSelectOptions from './prepare-rrna-select-options'
// Disabled — hierarchy is now hand-maintained (see prepareRrnaHierarchy() call below)
// import prepareRrnaHierarchy from './prepare-rrna-hierarchy'
import prepareRrnaCsvExportFile from './prepare-rrna-csv-export-file'
import prepare100DaysMission from './prepare-100-days-mission'
import prepare100DaysMissionSelectOptions from './prepare-100-days-mission-select-options'
import preparePolicyRoadmapSelectOptions from './prepare-policy-roadmap-select-options'
import preparePandemicIntelligence from './prepare-pandemic-inteligence'
import preparePandemicIntelligenceSelectOptions from './prepare-pandemic-intelligence-select-options'
import prepareGrantIdsForSitemap from './prepare-grant-ids-for-sitemap'
import { generateClinicalTrials } from './clinical-trials'
import verifyBuildArtefacts from '../verify-build-artefacts'
import { uploadStaticFiles, writeLastUsedFileIds, verifyGrants } from '../helpers/storage'
import dataSources from '../config/data-sources'
import { info } from '../helpers/log'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    // Determine if we should upload to remote storage.
    const isVercelBuild = process.env.VERCEL === '1'
    const forceUpload = process.env.FORCE_UPLOAD === 'true'
    const shouldUploadConditionsMet = isVercelBuild || forceUpload

    // The full grants CSV is part of the cached artefact set (uploadStaticFiles),
    // so on the non-cached path it must be generated BEFORE the upload below —
    // otherwise it is produced too late, never cached, and the next build's cache
    // restore 404s on it and falls back to a full rebuild. The other two CSVs are
    // not cached and are generated at the end of the build.
    const grantsCsvExport = {
        logTitle: 'Preparing CSV export file',
        dataFilePath: './data/dist/grants.json.gz',
        workbookTitle: 'Pandemic PACT Grants',
        exportPath: './public/export/grants',
        dataFileName: 'pandemic-pact-grants.csv',
    }

    const otherCsvExports = [
        {
            logTitle: 'Preparing 100 Days Mission CSV export file',
            dataFilePath: './public/data/100-days-mission/grants.json',
            workbookTitle: '100 Days Mission Grants',
            exportPath: './public/export/100-days-mission',
            dataFileName: '100-days-mission-grants.csv',
        },
        {
            logTitle: 'Preparing Pandemic Intelligence CSV export file',
            dataFilePath: './public/data/pandemic-intelligence/grants.json',
            workbookTitle: 'Pandemic Intelligence Grants',
            exportPath: './public/export/pandemic-intelligence',
            dataFileName: 'pandemic-intelligence-grants.csv',
        },
    ]

    const { useCachedFiles } = await downloadAndParseDataSheets()

    // If we're using cached files, skip all processing.
    // The source JSON data is already downloaded from blob storage.
    if (useCachedFiles) {
        info('Using cached static files - skipping grant processing and file generation')

        // PubMed is no longer fetched during deploy builds — a weekly GitLab CI
        // job refreshes the per-grant publication blobs and the OpenSearch
        // PublicationCount. Re-index without counts; prepareSearch preserves any
        // existing PublicationCount values when none are passed.
        await prepareSearch()
    } else {
        // prepareGrants collects the 100DM/PI subsets during its single stream
        // pass so those steps don't each re-read the full 1.1 GB raw file.
        const { hundredDaysMissionGrants, pandemicIntelligenceGrants } = await prepareGrants()

        prepareSelectOptions()

        prepareHomepageTotals()

        prepareVisualisePageGrantsFile()

        prepareMap()

        await prepare100DaysMission(hundredDaysMissionGrants)

        await prepare100DaysMissionSelectOptions()

        await preparePandemicIntelligence(pandemicIntelligenceGrants)

        await preparePandemicIntelligenceSelectOptions()

        await prepareRrna()

        await prepareRrnaSelectOptions()

        // Disabled: the RRNA filter hierarchy (public/manual-rrna-hierarchy-filters.json)
        // is now maintained by hand so its curated (non-alphabetical) ordering is
        // preserved. Re-enable prepareRrnaHierarchy() only if you want the file
        // regenerated from the RRNA data (note: it will revert to alphabetical order).
        // prepareRrnaHierarchy()

        // Like the grants CSV, the RRNA export CSV is part of the cached artefact
        // set (uploadStaticFiles), so it must be generated here — before the upload
        // below — otherwise the cached-path build can neither regenerate nor restore
        // it and /export/rrna/…csv 404s. It is generated only on this non-cached
        // path and restored from the cache otherwise.
        await prepareRrnaCsvExportFile()

        // Select options for the policy road maps dropdown on the explore page
        await preparePolicyRoadmapSelectOptions()

        // Generate the grants CSV before the upload so it is included in the
        // cached artefacts (it reads the finalised select-options above).
        prepareCsvExportFile(grantsCsvExport)

        // Upload Figshare-derived artefacts (homepage totals, grants, select
        // options) to the blob cache. The freshness marker is written at the very
        // end of this function, once the clinical-trials pipeline has run too.
        if (shouldUploadConditionsMet) {
            await uploadStaticFiles()
        }

        const { grantIds, changedIds } = await prepareIndividualGrantFiles(shouldUploadConditionsMet)

        // Verify the grant upload if it was performed
        if (shouldUploadConditionsMet && grantIds && grantIds.length > 0) {
            const stringGrantIds = grantIds.map(id => String(id)).filter(id => typeof id === 'string');
            await verifyGrants(stringGrantIds)
        }

        // Re-index OpenSearch. PubMed publication counts are refreshed by the
        // weekly GitLab job, so prepareSearch runs without counts here and
        // preserves any existing PublicationCount values. changedIds (when set)
        // limits the upsert to changed grants; removed grants are pruned anyway.
        await prepareSearch(undefined, changedIds)

        await prepareGrantIdsForSitemap()

        // Second upload pass to capture grant-ids.json (generated above).
        if (shouldUploadConditionsMet) {
            await uploadStaticFiles()
        }
    }

    // The 100 Days Mission and Pandemic Intelligence CSVs are not part of the
    // cached artefact set, so they are (re)generated here on both paths. The
    // grants CSV is handled above: generated before upload on the non-cached
    // path, or restored from the cache on the cached path.
    otherCsvExports.forEach(prepareCsvExportFile)

    // Clinical Research Registrations (ICTRP) — self-contained, fast dataset. Runs
    // its own ingest/transform/select-options/CSV/search pipeline. Skips itself if
    // the interim source CSV is absent (see generateClinicalTrials), so it is safe
    // to run on every build until the decoupled runner / Figshare ingestion lands.
    const clinicalTrialsUpToDate = await generateClinicalTrials(shouldUploadConditionsMet)

    // Assert the frontend's artefacts exist and hold a sane amount of data, on
    // both build paths. Deliberately before the marker write below: a failure here
    // must leave the source ids unmarked so the next build regenerates rather than
    // taking the cached path straight past the problem.
    await verifyBuildArtefacts(clinicalTrialsUpToDate)

    // Mark every source file ID as processed — deliberately here, at the end, and
    // on BOTH paths:
    //  - After generateClinicalTrials, so a CT failure leaves the CT ids unmarked
    //    and the next build retries rather than skipping generate for good.
    //  - On the cached path too, so a CT-only bump (which takes the grants cached
    //    path but still regenerates CT) records the new CT ids. Otherwise
    //    check-grants-freshness would report "changed" on every subsequent build
    //    and never converge. The grants/RRNA ids are unchanged by definition on
    //    that path, so writing them back is a no-op.
    //
    // Null CT ids when the CT run bailed out: the marker treats null as "changed",
    // so the next build re-runs generate instead of inheriting ids that were never
    // actually processed.
    if (shouldUploadConditionsMet) {
        await writeLastUsedFileIds({
            grantsId: dataSources.FIGSHARE_GRANTS_FILE_ID,
            rrnaId: dataSources.FIGSHARE_RRNA_FILE_ID,
            dictionaryId: dataSources.FIGSHARE_DATA_DICTIONARY_FILE_ID,
            rrnaDictionaryId: dataSources.FIGSHARE_RRNA_DATA_DICTIONARY_FILE_ID,
            clinicalTrialsId: clinicalTrialsUpToDate
                ? dataSources.FIGSHARE_CLINICAL_TRIALS_FILE_ID
                : null,
            clinicalTrialsDictionaryId: clinicalTrialsUpToDate
                ? dataSources.FIGSHARE_CLINICAL_TRIALS_DATA_DICTIONARY_FILE_ID
                : null,
        })
    }
}
