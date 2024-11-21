import fs from 'fs-extra'
import { parse } from 'fast-csv'
import { title, info, printWrittenFileStats } from '../helpers/log'

export default async function downloadAndParseDataSheet () {
    title('Fetching data sheets')

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/49506642?private_link=9e712aa1f4255e37b0db',
        'dictionary',
    )

    await downloadCsvAndConvertToJson(
        'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
        'research-category-mapping',
        false,
        ';'
    )

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/50659272?private_link=9e712aa1f4255e37b0db',
        'grants',
        true,
    )
}

interface ParseOptions {
    headers: boolean
    ignoreEmpty: boolean
    maxRows?: number
    delimiter?: string
}

async function downloadCsvAndConvertToJson(
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
}
