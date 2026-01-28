import { list } from '@vercel/blob'
import { info, warn } from './log'
import { getBranchName } from './get-branch-name'

/**
 * Fetches all grant data from Vercel Blob Storage
 * Returns an array of all grants
 */
export async function fetchAllGrantsFromBlob(): Promise<any[]> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN not set - cannot fetch grants from blob storage')
    }

    const baseUrl = process.env.BLOB_BASE_URL
    
    if (!baseUrl) {
        throw new Error('BLOB_BASE_URL not set - cannot fetch grants from blob storage')
    }

    const branchName = getBranchName()
    info(`Fetching all grants from Blob Storage for branch "${branchName}"...`)

    try {
        // List all grant files in blob storage
        const { blobs } = await list({
            prefix: `${branchName}/grants/`,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        info(`Found ${blobs.length} grant files in Blob Storage`)

        // Fetch all grants in parallel batches to avoid overwhelming the service
        const batchSize = 50
        const grants: any[] = []

        for (let i = 0; i < blobs.length; i += batchSize) {
            const batch = blobs.slice(i, i + batchSize)
            
            const batchResults = await Promise.all(
                batch.map(async (blob) => {
                    try {
                        const response = await fetch(blob.url)
                        
                        if (!response.ok) {
                            warn(`Failed to fetch ${blob.pathname}: ${response.status} ${response.statusText}`)
                            return null
                        }

                        return await response.json()
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error)
                        warn(`Error fetching ${blob.pathname}: ${errorMessage}`)
                        return null
                    }
                })
            )

            const validGrants = batchResults.filter(grant => grant !== null)
            grants.push(...validGrants)

            info(`Fetched ${grants.length}/${blobs.length} grants from Blob Storage`)
        }

        info(`✓ Successfully fetched ${grants.length} grants from Blob Storage`)
        return grants
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch grants from blob storage: ${errorMessage}`)
    }
}
