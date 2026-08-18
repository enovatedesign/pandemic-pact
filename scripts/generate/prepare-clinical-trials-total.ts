import fs from 'fs-extra'
import zlib from 'zlib'
import { DatasetConfig } from '../config/datasets'
import { title, info, printWrittenFileStats } from '../helpers/log'

const HOMEPAGE_TOTALS_PATH = './data/dist/homepage-totals.json'

/**
 * Merges the clinical-trials count into homepage-totals.json.
 *
 * It is merged rather than written by prepareHomepageTotals because that step
 * runs before the CT pipeline (and is skipped entirely on the grants cached
 * path), so the count is only knowable here. Runs on both CT paths — the count
 * is derived from the dist file, which is either freshly generated or restored
 * from the cache.
 */
export default function prepareClinicalTrialsTotal(config: DatasetConfig) {
    title('Adding clinical trials total to homepage totals')

    if (!fs.existsSync(HOMEPAGE_TOTALS_PATH)) {
        info(`${HOMEPAGE_TOTALS_PATH} does not exist — skipping`)
        return
    }

    const gzipBuffer = fs.readFileSync(config.outputPaths.distGz)
    const trials: any[] = JSON.parse(zlib.gunzipSync(gzipBuffer as any).toString())

    const totals = fs.readJsonSync(HOMEPAGE_TOTALS_PATH)

    totals.totalClinicalTrials = { finalCount: trials.length }

    info(`Total number of clinical research registrations: ${trials.length}`)

    fs.writeJsonSync(HOMEPAGE_TOTALS_PATH, totals)

    printWrittenFileStats(HOMEPAGE_TOTALS_PATH)
}
