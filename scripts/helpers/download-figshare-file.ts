import fs from 'fs-extra'
import path from 'path'
import { info } from './log'

/**
 * Downloads a single Figshare file (by file id) to disk using a personal access
 * token. Works for files behind a private share link — hitting the authenticated
 * `ndownloader` endpoint directly bypasses the figshare.com WAF challenge that
 * blocks unauthenticated share-link downloads.
 *
 * Returns the path the CSV was written to.
 */
export default async function downloadFigshareFile(
    fileId: number,
    destPath: string,
): Promise<string> {
    const token = process.env.FIGSHARE_PA_TOKEN

    if (!token) {
        throw new Error('FIGSHARE_PA_TOKEN not set, cannot download data from Figshare')
    }

    const url = `https://ndownloader.figshare.com/files/${fileId}`

    info(`Downloading Figshare file ${fileId}...`)

    const response = await fetch(url, {
        headers: { Authorization: `token ${token}` },
    })

    if (!response.ok) {
        throw new Error(
            `Failed to download Figshare file ${fileId}: ${response.status} ${response.statusText}`,
        )
    }

    const text = await response.text()

    fs.ensureDirSync(path.dirname(destPath))
    fs.writeFileSync(destPath, text)

    info(`Wrote Figshare file ${fileId} to ${destPath}`)

    return destPath
}
