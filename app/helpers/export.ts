export const fullDataFilename = 'grants/pandemic-pact-grants.csv'
export const filteredDataFilename = 'pandemic-pact-filtered-grants.csv'

export function fetchCsv(filename = fullDataFilename) {
    return fetch(`/export/${filename}`).then(response =>
        response.text()
    )
}

export function filterCsv(csv: string, grantIDs: string[]) {
    // Rather than attempting to parse the CSV, we can take advantage of
    // the fact that the first column is the Grant ID, and filter based on that,
    // thereby improving performance.
    return csv
        .split('\n')
        .filter((line, index) => {
            // Always include the header row
            if (index === 0) {
                return true
            }

            // Check if the first column contains one of our filtered Grant IDs
            return grantIDs.some(id => line.startsWith(`${id},`))
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
