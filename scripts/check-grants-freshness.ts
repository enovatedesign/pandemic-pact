import dotenv from 'dotenv'
import dataSources from './config/data-sources'
import { readGrantsLastUsedFileId } from './helpers/storage'
import { info } from './helpers/log'

/**
 * Decides whether the grants data has changed for the current branch, by
 * comparing the committed FIGSHARE_GRANTS_FILE_ID against the S3 freshness
 * marker — the SAME comparison download-and-parse-data-sheets.ts makes to choose
 * the full vs cached path.
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

    const configuredId = dataSources.FIGSHARE_GRANTS_FILE_ID
    const markerId = await readGrantsLastUsedFileId()

    const dataChanged = forceFullGenerate || configuredId !== markerId

    info(
        `Grants freshness: configured=${configuredId} marker=${markerId ?? '(none)'}` +
            (forceFullGenerate ? ' FORCE_FULL_GENERATE=true' : '') +
            ' → ' +
            (dataChanged ? 'CHANGED (full generate needed)' : 'unchanged (skip generate)'),
    )

    process.exit(dataChanged ? 0 : 1)
}
