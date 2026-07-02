import fs from 'fs-extra'
import zlib from 'zlib'

const GRANTS_DIST_PATH = './data/dist/grants.json.gz'

let cache: { mtimeMs: number; size: number; grants: any[] } | null = null

/**
 * Reads and parses the gzipped grants dist file (`grants.json.gz`), memoised for
 * the lifetime of the process.
 *
 * Several generate steps each need the full grants array; without this they would
 * each gunzip + JSON.parse the ~21 MB gz (~150 MB parsed) independently, costing
 * ~15–30 s aggregate on a full build. The cache is keyed on the file's mtime/size
 * so it is invalidated if the dist file is rewritten (e.g. between the cached and
 * fresh paths).
 *
 * The returned array is SHARED across callers (not copied) — treat it as
 * read-only. All current consumers only `.map`/`.filter`/`pick` into new objects.
 */
export default function readGrantsDist(): any[] {
    const { mtimeMs, size } = fs.statSync(GRANTS_DIST_PATH)

    if (cache && cache.mtimeMs === mtimeMs && cache.size === size) {
        return cache.grants
    }

    const gzipBuffer = fs.readFileSync(GRANTS_DIST_PATH)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const grants: any[] = JSON.parse(jsonBuffer.toString())

    cache = { mtimeMs, size, grants }

    return grants
}
