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
import prepare100DaysMission from './prepare-100-days-mission'
import prepare100DaysMissionSelectOptions from './prepare-100-days-mission-select-options'
import preparePolicyRoadmapSelectOptions from './prepare-policy-roadmap-select-options'
import preparePandemicIntelligence from './prepare-pandemic-inteligence'
import preparePandemicIntelligenceSelectOptions from './prepare-pandemic-intelligence-select-options'
import prepareGrantIdsForSitemap from './prepare-grant-ids-for-sitemap'
import { uploadStaticFiles, writeGrantsLastUsedFileId, verifyGrants } from '../helpers/storage'
import dataSources from '../config/data-sources'
import { info } from '../helpers/log'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    // Determine if we should upload to blob storage.
    const isVercelBuild = process.env.VERCEL === '1'
    const forceUpload = process.env.FORCE_BLOB_UPLOAD === 'true' || process.env.FORCE_S3_UPLOAD === 'true'
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
        await prepareGrants()

        prepareSelectOptions()

        prepareHomepageTotals()

        prepareVisualisePageGrantsFile()

        prepareMap()

        await prepare100DaysMission()

        await prepare100DaysMissionSelectOptions()

        await preparePandemicIntelligence()

        await preparePandemicIntelligenceSelectOptions()

        // Select options for the policy road maps dropdown on the explore page
        await preparePolicyRoadmapSelectOptions()

        // Generate the grants CSV before the upload so it is included in the
        // cached artefacts (it reads the finalised select-options above).
        prepareCsvExportFile(grantsCsvExport)

        // Upload Figshare-derived artefacts (homepage totals, grants, select
        // options) to the blob cache and mark this grants file ID as processed.
        if (shouldUploadConditionsMet) {
            await uploadStaticFiles()
            await writeGrantsLastUsedFileId(dataSources.FIGSHARE_GRANTS_FILE_ID)
        }

        const grantIds = await prepareIndividualGrantFiles(shouldUploadConditionsMet)

        // Verify the grant upload if it was performed
        if (shouldUploadConditionsMet && grantIds && grantIds.length > 0) {
            const stringGrantIds = grantIds.flat().map(id => String(id)).filter(id => typeof id === 'string');
            await verifyGrants(stringGrantIds)
        }

        // Re-index OpenSearch. PubMed publication counts are refreshed by the
        // weekly GitLab job, so prepareSearch runs without counts here and
        // preserves any existing PublicationCount values.
        await prepareSearch()

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
}
