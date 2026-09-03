// Split out of export.ts so the build scripts and tests can compile it without
// the DOM lib — export.ts also touches Blob/window/document.

/**
 * Narrows an export CSV to the given record ids.
 *
 * Matches on the raw first column rather than parsing the CSV: the exports are
 * up to ~100 MB and run through this in the browser. The id must therefore be
 * the first column — scripts/verify-build-artefacts.ts asserts that per dataset.
 */
export function filterCsv(csv: string, ids: string[]) {
    const idSet = new Set(ids.map(id => `${id},`))

    return csv
        .split('\n')
        .filter((line, index) => {
            // Always include the header row
            if (index === 0) {
                return true
            }

            const firstComma = line.indexOf(',')

            if (firstComma === -1) {
                return false
            }

            return idSet.has(line.slice(0, firstComma + 1))
        })
        .join('\n')
}
