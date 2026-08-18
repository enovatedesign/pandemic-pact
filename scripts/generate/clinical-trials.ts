import dotenv from 'dotenv'
import csvFileToJson from '../helpers/convert-csv-file-to-json'
import downloadFigshareFile from '../helpers/download-figshare-file'
import prepareTrials from './prepare-trials'
import prepareIndividualTrialFiles from './prepare-individual-trial-files'
import prepareTrialsSelectOptions from './prepare-trials-select-options'
import prepareTrialsSearch, {
    trialsSearchIndexNeedsPopulating,
} from './prepare-trials-search'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareClinicalTrialsTotal from './prepare-clinical-trials-total'
import clinicalTrialsColumnOrder from '../helpers/clinical-trials-column-order'
import datasets from '../config/datasets'
import { title, info, warn, error } from '../helpers/log'
import { readTrialsLastUsedFileIds, writeTrialsLastUsedFileIds } from '../helpers/trials-marker'
import { uploadTrialsStaticFiles } from '../helpers/upload-trials-static-files'
import { downloadTrialsStaticFiles } from '../helpers/download-trials-static-files'

/**
 * Generates the Clinical Research Registrations (ICTRP) dataset artefacts.
 *
 * Exposed as a standalone, per-dataset entry point so it can be invoked directly
 * for local verification and later slotted into a decoupled generation runner
 * (see the build-streamlining follow-up) without being coupled to `next build`.
 *
 * Returns true when the published CT artefacts reflect the currently configured
 * source file ids — either regenerated from them or restored from a cache built
 * on them. False means the run bailed out (no Figshare token), so the caller must
 * NOT record those ids as processed or the pending update would be lost.
 */
export async function generateClinicalTrials(shouldUpload: boolean = false): Promise<boolean> {
    const config = datasets.clinicalTrials

    title(`Generating dataset: ${config.label}`)

    const { figshareFileId, dataDictionaryFileId } = config.source

    const downloadDir = './data/download/clinical-trials'

    if (!figshareFileId) {
        throw new Error('clinical-trials: no figshareFileId configured')
    }

    // CSV export config — used by both the full path and the skip path so the
    // download stays available regardless of which path runs.
    const csvExport = {
        logTitle: 'Preparing clinical trials CSV export file',
        dataFilePath: config.outputPaths.distGz,
        workbookTitle: 'Clinical Research Registrations',
        exportPath: './public/export/clinical-trials',
        dataFileName: 'pandemic-pact-clinical-trials.csv',
        selectOptionsPath: config.outputPaths.selectOptionsJson,
        idField: config.idField,
        columnOrder: clinicalTrialsColumnOrder,
    }

    // --- Freshness gate ---------------------------------------------------------
    // Skip the expensive regeneration (Figshare download, transform, per-trial
    // file generation + S3 upload) when the CT source file id is unchanged since
    // the last build. Mirrors the grants freshness gate: the marker is branch-
    // scoped, so a new branch always full-generates first (populating its S3
    // prefix + OpenSearch index) before any later build is allowed to skip.
    // FORCE_FULL_GENERATE bypasses the gate.
    const forceFullGenerate = process.env.FORCE_FULL_GENERATE === 'true'
    const {
        trialsId: previousFileId,
        dictionaryId: previousDictionaryFileId,
    } = await readTrialsLastUsedFileIds()

    // The dictionary counts as a source: it supplies the select-option labels and
    // the canonical checkbox codes, so a dictionary-only bump changes the output
    // even when the dataset itself is untouched.
    const fileIdHasChanged =
        forceFullGenerate ||
        figshareFileId !== previousFileId ||
        (dataDictionaryFileId ?? null) !== previousDictionaryFileId

    if (forceFullGenerate) {
        info('FORCE_FULL_GENERATE set — forcing full clinical-trials generation')
    }

    if (!fileIdHasChanged) {
        info('Clinical trials data source has not changed since last fetch')

        let restored = false
        try {
            restored = await downloadTrialsStaticFiles(config)
        } catch (err) {
            warn(`Clinical-trials cache restore errored: ${err instanceof Error ? err.message : String(err)}`)
        }

        if (restored) {
            info('Using cached clinical-trials static files from remote storage')

            // Rebuild the CSV export from the restored dist (cheap, local) so the
            // download stays available on the skip path.
            prepareCsvExportFile(csvExport)

            prepareClinicalTrialsTotal(config)

            // Re-index only if the index is missing/empty. The per-trial S3 files
            // and the OpenSearch index both persist across builds for this branch,
            // so an unchanged dataset needs no re-upload and usually no re-index.
            if (await trialsSearchIndexNeedsPopulating(config)) {
                info('Clinical-trials search index missing or empty — re-indexing from cache')
                await prepareTrialsSearch(config)
            } else {
                info('Clinical-trials search index already populated — skipping re-index')
            }

            return true
        }

        info('Cached clinical-trials static files unavailable — proceeding to full generation.')
    }

    // --- Full generation --------------------------------------------------------
    // Ingesting from Figshare requires a token; skip (rather than fail the whole
    // build) if it's absent and no cache was available above.
    if (!process.env.FIGSHARE_PA_TOKEN) {
        info('clinical-trials: FIGSHARE_PA_TOKEN not set — skipping clinical-trials generation')
        return false
    }

    const trialsCsvPath = `${downloadDir}/trials-source.csv`
    await downloadFigshareFile(figshareFileId, trialsCsvPath)
    await csvFileToJson(trialsCsvPath, downloadDir, 'trials', true)

    // --- Ingest the data dictionary (for select-option labels) ------------------
    if (dataDictionaryFileId) {
        const dictionaryCsvPath = `${downloadDir}/dictionary-source.csv`
        await downloadFigshareFile(dataDictionaryFileId, dictionaryCsvPath)
        await csvFileToJson(dictionaryCsvPath, downloadDir, 'dictionary')
    } else {
        info('No CT data dictionary file id configured — select-option labels may be unavailable')
    }

    // --- Transform records ------------------------------------------------------
    await prepareTrials(config)

    // --- Select options (filter dropdown values + labels) -----------------------
    prepareTrialsSelectOptions(config)

    // --- Individual per-trial files (powers the /clinical-trials/[id] pages) ----
    // Runs after select-options so codes can be resolved to labels; optionally
    // mirrors each file to S3/CloudFront (parity with the grants dataset).
    await prepareIndividualTrialFiles(config, shouldUpload)

    // --- CSV export (full + filtered download on the explore page) --------------
    prepareCsvExportFile(csvExport)

    // --- OpenSearch index (powers the explore page) -----------------------------
    await prepareTrialsSearch(config)

    // --- Homepage total ---------------------------------------------------------
    prepareClinicalTrialsTotal(config)

    // --- Cache the static artefacts + record this file id as processed ----------
    // Only when we actually uploaded to S3 — otherwise there is no cache for the
    // next build to restore, and the marker would point at nothing.
    if (shouldUpload) {
        await uploadTrialsStaticFiles(config)
        await writeTrialsLastUsedFileIds({
            trialsId: figshareFileId,
            dictionaryId: dataDictionaryFileId ?? null,
        })
    }

    return true
}

// Allow running this file directly: `node ./compiled-scripts/scripts/generate/clinical-trials.js`
if (require.main === module) {
    dotenv.config({ path: './.env.local' })

    generateClinicalTrials()
        .then(() => {
            info('Clinical trials generation complete')
            process.exit(0)
        })
        .catch(err => {
            error(err?.stack || String(err))
            process.exit(1)
        })
}
