import fs from 'fs-extra'
import zlib from 'zlib'
import { utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { keyMapping } from '../helpers/key-mapping'
import { Grant } from '../types/generate'

interface SelectOptions {
    [key: string]: { value: string; label: string }[]
}

export default function prepareCsvExportFile({
    logTitle,
    dataFilePath,
    workbookTitle,
    exportPath,
    dataFileName,
}: {
    logTitle: string
    dataFilePath: string
    workbookTitle: string
    exportPath: string
    dataFileName: string
}) {
    title(logTitle)

    const isZipped = dataFilePath.endsWith('.gz')

    let grants: Grant[] = []

    if (isZipped) {
        const gzipBuffer = fs.readFileSync(dataFilePath)
        const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
        grants = JSON.parse(jsonBuffer.toString())
    } else {
        grants = fs.readJsonSync(dataFilePath)
    }

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

    // The new "Pathogens", "Diseases" and "Strains" fields are added to the select options manually and therefore do not exist within the keyMapping object
    // It has been requested that these fields are visible in the export and are in a defined order after the existing "Families" field.

    // Get the defined values from keyMapping
    const fieldsForExport = Object.keys(grants[0])

    // Only insert fields that aren't already present in the data
    // (e.g. Pandemic Intelligence grants already include Pathogens and Diseases)
    const fieldsToInsert = ["Pathogens", "Diseases", "Strains"]
        .filter(field => !fieldsForExport.includes(field))

    if (fieldsToInsert.length > 0) {
        const familiesIndex = fieldsForExport.indexOf("Families")
        fieldsForExport.splice(familiesIndex + 1, 0, ...fieldsToInsert)
    }

    // Prepare a export row for each grant
    const rows = grants.map((grant: any, index: number, array: any[]) => {
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        let row: any = {}

        // Instead of iterating through the grant object, we iterate through our predefined `fieldsForExport` array. 
        // This ensures the columns are created in the correct order.
        fieldsForExport.forEach(field => {
            const value = grant[field]

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
    utils.book_append_sheet(workbook, worksheet, workbookTitle)

    // Convert the workbook to a CSV file
    const csvData = utils.sheet_to_csv(worksheet)

    fs.emptyDirSync(exportPath)

    const pathname = `${exportPath}/${dataFileName}`

    fs.writeFileSync(pathname, csvData, 'utf-8')

    printWrittenFileStats(pathname)
}
