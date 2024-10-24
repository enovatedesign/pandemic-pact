import fs from 'fs-extra'
// @ts-ignore
import StreamArray from 'stream-json/streamers/StreamArray'

export default async function readLargeJson(filePath: string) {
    const jsonStream = StreamArray.withParser();
    const dataToReturn: any[] = []
    
    return new Promise((resolve, reject) => {
        jsonStream.on('data', (data: any) => {
            dataToReturn.push(data.value)
        })
        .on('end', () => {
            resolve(dataToReturn)
        })
        .on('error', (error: any) => {
            console.error(error)
            reject(error)
        })
        
        fs.createReadStream(filePath).pipe(jsonStream.input)
    })
}
