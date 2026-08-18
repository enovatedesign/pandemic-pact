import fs from 'fs-extra'
import zlib from 'zlib'
import { utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'
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
    selectOptionsPath = './data/dist/select-options.json',
    idField,
    columnOrder,
}: {
    logTitle: string
    dataFilePath: string
    workbookTitle: string
    exportPath: string
    dataFileName: string
    /** Where this dataset's select-options live (value -> label). */
    selectOptionsPath?: string
    /**
     * The unique id field. When set it is forced to the first CSV column so the
     * filtered-download helper (which matches on the first column) works.
     */
    idField?: string
    /**
     * Explicit CSV column order. Without it the columns follow the key order of
     * the prepared records, which groups by how the data was assembled rather
     * than by meaning.
     *
     * Listed fields come first, in this order; any field present in the data but
     * missing from the list is appended in its original position-order, so a new
     * source column is never silently dropped from the download.
     */
    columnOrder?: string[]
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

    if (grants.length === 0) {
        throw new Error(
            `No records found in ${dataFilePath} — cannot build CSV export "${workbookTitle}". The source data is empty or failed to download/decompress.`,
        )
    }

    const selectOptions: SelectOptions = fs.readJsonSync(selectOptionsPath)

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

    // Get the field list from the first record.
    const fieldsForExport = Object.keys(grants[0])

    // Only insert fields that aren't already present in the data
    // (e.g. Pandemic Intelligence grants already include Pathogens and Diseases;
    // clinical trials already include all three). Guarded on a Families column
    // existing so datasets without one are unaffected.
    const fieldsToInsert = ["Pathogens", "Diseases", "Strains"]
        .filter(field => !fieldsForExport.includes(field))

    const familiesIndex = fieldsForExport.indexOf("Families")

    if (fieldsToInsert.length > 0 && familiesIndex >= 0) {
        fieldsForExport.splice(familiesIndex + 1, 0, ...fieldsToInsert)
    }

    // Apply the dataset's explicit column order, keeping any unlisted fields
    // (new source columns, one-off additions) at the end rather than losing them.
    if (columnOrder) {
        const listed = columnOrder.filter(field => fieldsForExport.includes(field))
        const unlisted = fieldsForExport.filter(field => !columnOrder.includes(field))

        if (unlisted.length > 0) {
            info(
                `Fields missing from the configured column order, appended to the end: ${unlisted.join(', ')}`,
            )
        }

        fieldsForExport.splice(0, fieldsForExport.length, ...listed, ...unlisted)
    }

    // Force the id field to the first column so the filtered-download helper
    // (which matches rows on the first column) works for this dataset.
    if (idField && fieldsForExport.includes(idField)) {
        fieldsForExport.splice(fieldsForExport.indexOf(idField), 1)
        fieldsForExport.unshift(idField)
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
                    // Otherwise just get the label for the single value. Fall
                    // back to the raw value when the code isn't in the options
                    // map, otherwise the missing label serialises as the literal
                    // string "undefined" in the exported CSV.
                    row[field] =
                        selectOptionsMap.get(field).get(grant[field]) ??
                        grant[field] ??
                        ''
                }
            } else if (Array.isArray(value)) {
                // Free-text multi-value fields have no labels to look up, but
                // still need flattening — xlsx cannot write an array to a cell.
                row[field] = value.join(' | ')
            } else {
                // Otherwise export the value as is
                row[field] = grant[field]
            }
        })

        return row
    })

    // Convert the array of objects to a worksheet
    const worksheet = utils.json_to_sheet(rows, { header: fieldsForExport })

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
