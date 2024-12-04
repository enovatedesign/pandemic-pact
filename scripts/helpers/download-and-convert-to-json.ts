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
        
        let firstWrite = true
        
        return new Promise((resolve: any, reject: any) => {
            const stream = parse(options)
                .on('error', error => {
                    writeStream.end()
                    console.error(filePath, error)
                    reject(error)
                })
                .on('data', row => {
                    if (!firstWrite) {
                        writeStream.write(',')
                    } else {
                        if (headers) writeStream.write('[')
                        firstWrite = false
                    }
                    
                    writeStream.write(JSON.stringify(row))
                })
                .on('end', () => {
                    if (headers) writeStream.write(']')
                    writeStream.end()
                    printWrittenFileStats(filePath)
                    resolve()
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
