import fs from 'fs-extra'
import { parse } from 'fast-csv'
import { info, printWrittenFileStats } from './log'

interface ParseOptions {
    headers: boolean
    ignoreEmpty: boolean
    maxRows?: number
    delimiter?: string
}

/**
 * Reads a CSV that already exists on disk and writes it out as JSON, mirroring
 * the output shape of download-and-convert-to-json.ts (an array of row objects,
 * plus an optional `<name>-headings.json` containing the header row).
 *
 * Used by the clinical-trials pipeline to parse the CSV downloaded from Figshare.
 */
export default async function csvFileToJson(
    csvPath: string,
    outputDir: string,
    outputFileName: string,
    dumpHeadingRow: boolean = false,
    delimiter?: string,
) {
    if (!fs.existsSync(csvPath)) {
        throw new Error(`CSV not found at "${csvPath}"`)
    }

    fs.ensureDirSync(outputDir)

    const csv = await fs.readFile(csvPath, 'utf8')

    info(`Read CSV from ${csvPath}`)

    async function streamToJson(
        filePath: string,
        headers: boolean = true,
    ) {
        const writeStream = fs.createWriteStream(filePath)

        const options: ParseOptions = {
            headers,
            ignoreEmpty: true,
        }

        if (!headers) {
            options.maxRows = 1
        }

        if (delimiter) {
            options.delimiter = delimiter
        }

        let rowCount = 0
        let arrayStarted = false

        return new Promise((resolve: any, reject: any) => {
            const stream = parse(options)
                .on('error', error => {
                    writeStream.end()
                    console.error(filePath, error)
                    reject(error)
                })
                .on('data', row => {
                    if (!arrayStarted && headers) {
                        writeStream.write('[')
                        arrayStarted = true
                    }

                    if (rowCount > 0) {
                        writeStream.write(',')
                    }

                    writeStream.write(JSON.stringify(row))
                    rowCount++
                })
                .on('end', () => {
                    if (headers) {
                        if (!arrayStarted) {
                            writeStream.write('[')
                        }
                        writeStream.write(']')
                    }

                    if (rowCount === 0) {
                        writeStream.end()
                        const error = new Error(
                            `No rows parsed from CSV for ${filePath}. Check delimiter and CSV format.`,
                        )
                        console.error(error.message)
                        reject(error)
                        return
                    }

                    info(`Parsed ${rowCount} rows`)

                    writeStream.end(() => {
                        printWrittenFileStats(filePath)
                        resolve()
                    })
                })

            stream.write(csv)
            stream.end()
        })
    }

    if (dumpHeadingRow) {
        await streamToJson(`${outputDir}/${outputFileName}-headings.json`, false)
    }

    await streamToJson(`${outputDir}/${outputFileName}.json`)
}
