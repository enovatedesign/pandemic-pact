import fs from 'fs-extra'
import { parse } from 'fast-csv'
import { info, printWrittenFileStats } from './log'

interface ParseOptions {
    headers: boolean
    ignoreEmpty: boolean
    maxRows?: number
    delimiter?: string
}

export default async function downloadCsvAndConvertToJson(
    url: string,
    outputFileName: string,
    dumpHeadingRow: boolean = false,
    delimiter?: string
) {
    const outputPath = `data/download`
    const csv = await fetch(url).then(res => res.text())
    
    info(`Fetched file from ${url}`)
    
    async function streamToJson(
        filePath: string, 
        headers: boolean = true,
        maxRows?: number
    )  { 
        const writeStream = fs.createWriteStream(filePath)
        
        const options: ParseOptions = {
            headers,
            ignoreEmpty: true
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
                        const error = new Error(`No rows parsed from CSV for ${filePath}. Check delimiter and CSV format.`)
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
        await streamToJson(`${outputPath}/${outputFileName}-headings.json`, false)
    }
    
    await streamToJson(`${outputPath}/${outputFileName}.json`)
    console.log('Finished downloading grants')
}
