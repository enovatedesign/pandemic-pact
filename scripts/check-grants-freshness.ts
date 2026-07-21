import dotenv from 'dotenv'
import dataSources from './config/data-sources'
import { readLastUsedFileIds } from './helpers/storage'
import { info } from './helpers/log'

/**
 * Decides whether the source data has changed for the current branch, by
 * comparing the committed Figshare file IDs (grants + RRNA data and their data
 * dictionaries) against the S3 freshness marker — the SAME comparison
 * download-and-parse-data-sheets.ts makes to choose the full vs cached path.
 *
 * Used by the decouple-heavy-build orchestration (deploy_develop /
 * deploy_production in .gitlab-ci.yml) to decide whether to run a full generate
 * on the GitLab runner before firing the Vercel deploy hook.
 *
 * Exit code is the signal (so it can gate a shell `if`):
 *   0 → data CHANGED   → run the full generate
 *   1 → data unchanged → skip generate; Vercel takes its cached path
 *
 * This is best-effort, not load-bearing: if it is ever wrong, the hook-triggered
 * Vercel build sees a marker mismatch and does a correct (if slower) full build
 * itself.
 */
main()

async function main() {
    dotenv.config({ path: './.env.local' })

    // FORCE_FULL_GENERATE must be honoured HERE too, not just inside
    // download-and-parse-data-sheets.ts: this gate decides whether `npm run
    // generate` runs at all, so if it ignored the flag the forced full path
    // would never be reached when the file ID is unchanged.
    const forceFullGenerate = process.env.FORCE_FULL_GENERATE === 'true'

    const configuredGrantsId = dataSources.FIGSHARE_GRANTS_FILE_ID
    const configuredRrnaId = dataSources.FIGSHARE_RRNA_FILE_ID
    const configuredDictionaryId = dataSources.FIGSHARE_DATA_DICTIONARY_FILE_ID
    const configuredRrnaDictionaryId = dataSources.FIGSHARE_RRNA_DATA_DICTIONARY_FILE_ID
    const {
        grantsId: markerGrantsId,
        rrnaId: markerRrnaId,
        dictionaryId: markerDictionaryId,
        rrnaDictionaryId: markerRrnaDictionaryId,
    } = await readLastUsedFileIds()

    const dataChanged = forceFullGenerate ||
        configuredGrantsId !== markerGrantsId ||
        configuredRrnaId !== markerRrnaId ||
        configuredDictionaryId !== markerDictionaryId ||
        configuredRrnaDictionaryId !== markerRrnaDictionaryId

    info(
        `Data source freshness: ` +
            `grants configured=${configuredGrantsId} marker=${markerGrantsId ?? '(none)'}, ` +
            `rrna configured=${configuredRrnaId} marker=${markerRrnaId ?? '(none)'}, ` +
            `dictionary configured=${configuredDictionaryId} marker=${markerDictionaryId ?? '(none)'}, ` +
            `rrnaDictionary configured=${configuredRrnaDictionaryId} marker=${markerRrnaDictionaryId ?? '(none)'}` +
            (forceFullGenerate ? ' FORCE_FULL_GENERATE=true' : '') +
            ' → ' +
            (dataChanged ? 'CHANGED (full generate needed)' : 'unchanged (skip generate)'),
    )

    process.exit(dataChanged ? 0 : 1)
}
