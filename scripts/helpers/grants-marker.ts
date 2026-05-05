import { put } from '@vercel/blob'
import { getBranchName } from './get-branch-name'
import { warn } from './log'

const MARKER_FILENAME = 'grants-last-used-file-id.json'

function markerKey(): string {
    return `${getBranchName()}/cache/${MARKER_FILENAME}`
}

export async function readGrantsLastUsedFileId(): Promise<number | null> {
    const baseUrl = process.env.BLOB_BASE_URL

    if (!baseUrl) return null

    try {
        const response = await fetch(`${baseUrl}/${markerKey()}`)
        if (!response.ok) return null

        const data = await response.json()
        return typeof data?.id === 'number' ? data.id : null
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        warn(`Failed to read grants marker from blob: ${msg}`)
        return null
    }
}

export async function writeGrantsLastUsedFileId(id: number): Promise<void> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return

    await put(markerKey(), JSON.stringify({ id }), {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })
}
