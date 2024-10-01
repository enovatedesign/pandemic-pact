import fs from 'fs-extra'
import { utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { keyMapping } from '../helpers/key-mapping'
import { fullDataFilename } from '../../app/helpers/export'

interface SelectOptions {
    [key: string]: { value: string; label: string }[]
}

export default function () {
    title('Preparing CSV export file')

    const grants = fs.readJsonSync('./data/dist/grants.json')

    const selectOptions: SelectOptions = fs.readJsonSync(
        './data/dist/select-options.json'
    )

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

    const fieldsForExport = Object.values(keyMapping)

    // Prepare a export row for each grant
    const rows = grants.map((grant: any, index: number, array: any[]) => {
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        let row: any = {}

        Object.entries(grant).forEach(([field, value]) => {
            // Skip fields that are not needed in the export
            if (!fieldsForExport.includes(field)) {
                return
            }

            // If the field is a select option, replace the value(s) with the
            // corresponding label(s)
            if (selectOptionsMap.has(field)) {
                if (Array.isArray(value)) {
                    // If it's an array of values, get the label for each value
                    // and combine them into a single string separated by |
                    row[field] = value
                        .map((v: string) => selectOptionsMap.get(field).get(v))
                        .filter((v: string) => v)
                        .join(' | ')
                } else {
                    // Otherwise just get the label for the single value
                    row[field] = selectOptionsMap.get(field).get(grant[field])
                }
            } else {
                // Otherwise export the value as is
                row[field] = grant[field]
            }
        })

        return row
    })

    // Convert the array of objects to a worksheet
    const worksheet = utils.json_to_sheet(rows)

    // Create a workbook with the worksheet
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Pandemic PACT Grants')

    // Convert the workbook to a CSV file
    const csvData = utils.sheet_to_csv(worksheet)

    // Write the CSV data to a file
    const path = './public/export'

    fs.emptyDirSync(path)

    const pathname = `${path}/${fullDataFilename}`

    fs.writeFileSync(pathname, csvData, 'utf-8')

    printWrittenFileStats(pathname)
}
