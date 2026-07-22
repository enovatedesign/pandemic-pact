import fs from 'fs-extra'
import { utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { keyMapping } from '../helpers/key-mapping'
import { fullRrnaDataFilename } from '../../app/helpers/export'

interface SelectOptions {
    [key: string]: { value: string; label: string }[]
}

export default function prepareRrnaCsvExportFile() {
    title('Preparing RRNA CSV export file')

    const studies = fs.readJsonSync('./data/dist/rrna/studies.json')

    const selectOptions: SelectOptions = fs.readJsonSync(
        './data/dist/rrna/select-options.json'
    )

    // Some study fields hold select-option codes but are named differently to
    // their select-option list (which drives the label lookup below). Map the
    // study field name to the matching select-option key so their codes are
    // resolved to human-readable labels instead of being exported blank.
    const selectOptionsFieldAliases: Record<string, string> = {
        Families: 'Pathogen Family',
        Diseases: 'Disease',
        StudyCountry: 'Study Country',
    }

    // Convert the select options to a map for performance
    const selectOptionsMap = new Map()

    // Each field in the selectOptionsMap will contain a map containing
    // the value and its corresponding label
    Object.entries(selectOptions).forEach(([field, options]) => {
        const map = new Map()

        options.forEach(({ value, label }) => {
            map.set(value, label)
        })

        selectOptionsMap.set(field, map)
    })

    // Prepare a export row for each study
    const rows = studies.map((study: any, index: number, array: any[]) => {
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} studies`)
        }

        let row: any = {}

        Object.entries(study).forEach(([field, value]) => {
            // Resolve the select-option list for this field, allowing for fields
            // whose name differs from their option key (e.g. Families -> Pathogen
            // Family).
            const optionKey = selectOptionsFieldAliases[field] ?? field
            const optionMap = selectOptionsMap.get(optionKey)

            if (Array.isArray(value)) {
                // Join array values into a single string separated by |. When a
                // select-option list exists, resolve each code to its label
                // (dropping unmapped codes); otherwise the array already holds
                // display values (or has no label source), so join as-is. Either
                // way we must flatten arrays, as xlsx exports array cells blank.
                row[field] = (optionMap
                    ? value.map((v: string) => optionMap.get(v)).filter((v: string) => v)
                    : value.filter((v: any) => v != null && v !== '')
                ).join(' | ')
            } else if (optionMap) {
                // Get the label for the single value
                row[field] = optionMap.get(value)
            } else {
                // Otherwise export the value as is
                row[field] = value
            }
        })

        return row
    })

    // Determine the full column order (first-seen across all rows, since studies
    // do not all share the same keys), then move the sparse family-specific
    // free-text "...Other" columns to the end of the file so the meaningful
    // fields come first.
    const seenColumns = new Set<string>()
    const columns: string[] = []
    rows.forEach((row: any) => {
        Object.keys(row).forEach(key => {
            if (!seenColumns.has(key)) {
                seenColumns.add(key)
                columns.push(key)
            }
        })
    })

    const isOtherColumn = (key: string) => key.endsWith('Other')
    const orderedColumns = [
        ...columns.filter(key => !isOtherColumn(key)),
        ...columns.filter(isOtherColumn),
    ]

    // Convert the array of objects to a worksheet
    const worksheet = utils.json_to_sheet(rows, { header: orderedColumns })
    
    // Create a workbook with the worksheet
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Pandemic PACT RRNA Studies')

    // Convert the workbook to a CSV file
    const csvData = utils.sheet_to_csv(worksheet)

    const pathParts = fullRrnaDataFilename.split('/')

    // Write the CSV data to a file
    const path = `./public/export/${pathParts.slice(0, pathParts.length - 1).join('/')}`

    fs.emptyDirSync(path)

    const pathname = `${path}/${pathParts.at(-1)}`

    fs.writeFileSync(pathname, csvData, 'utf-8')

    printWrittenFileStats(pathname)
}
