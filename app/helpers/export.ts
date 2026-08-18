export const fullDataFilename = 'grants/pandemic-pact-grants.csv'
export const filteredDataFilename = 'grants/pandemic-pact-filtered-grants.csv'

export const fullRrnaDataFilename = 'rrna/pandemic-pact-rrna-studies.csv'
export const rrnaFilteredDataFilename = 'rrna/pandemic-pact-filtered-rrna-studies.csv'

export const clinicalTrialsFullDataFilename =
    'clinical-trials/pandemic-pact-clinical-trials.csv'
export const clinicalTrialsFilteredDataFilename =
    'pandemic-pact-filtered-clinical-trials.csv'

export async function fetchCsv(filename = fullDataFilename) {
    const response = await fetch(`/export/${filename}`)

    // The export CSVs are generated at build time (public/export is gitignored).
    // If the file is missing on a given deployment the server returns an error
    // page, not the CSV — fail loudly rather than letting the caller download an
    // HTML/fallback body saved as a .csv.
    if (!response.ok) {
        throw new Error(
            `Failed to fetch export CSV "/export/${filename}": ${response.status} ${response.statusText}`,
        )
    }

    return response.text()
}

export function filterCsv(csv: string, ids: string[]) {
    // Rather than attempting to parse the CSV, we can take advantage of the fact
    // that the first column is the record's id (Grant ID, Trial ID or RRNA ID)
    // and filter on that, thereby improving performance.
    return csv
        .split('\n')
        .filter((line, index) => {
            // Always include the header row
            if (index === 0) {
                return true
            }

            // Check if the first column matches one of our filtered ids
            return ids.some(id => line.startsWith(`${id},`))
        })
        .join('\n')
}

export function downloadCsv(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()

    window.URL.revokeObjectURL(url)
    a.remove()
}
