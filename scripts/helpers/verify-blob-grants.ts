import { info, warn } from './log'
import { getBranchName } from './get-branch-name'

/**
 * Verifies that a sample of grant files are accessible from Vercel Blob Storage
 * Returns true if all sampled grants are accessible, false otherwise
 */
export async function verifyBlobGrants(
    grantIds: string[],
    sampleSize: number = 5
): Promise<boolean> {
    if (!process.env.BLOB_BASE_URL) {
        warn('BLOB_BASE_URL not set, skipping blob verification')
        return false
    }

    const baseUrl = process.env.BLOB_BASE_URL
    const branchName = getBranchName()
    
    // Select random sample of grant IDs
    const shuffled = [...grantIds].sort(() => Math.random() - 0.5)
    const sample = shuffled.slice(0, Math.min(sampleSize, grantIds.length))

    info(`Verifying ${sample.length} sample grants from Blob Storage for branch "${branchName}"...`)

    const results = await Promise.all(
        sample.map(async (id) => {
            try {
                const url = `${baseUrl}/${branchName}/grants/${id}.json`
                const response = await fetch(url)
                
                if (!response.ok) {
                    warn(`Failed to fetch grant ${id}: ${response.status} ${response.statusText}`)
                    return false
                }

                // Verify it's valid JSON
                await response.json()
                return true
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                warn(`Error verifying grant ${id}: ${errorMessage}`)
                return false
            }
        })
    )

    const successCount = results.filter(Boolean).length
    const allSuccessful = successCount === sample.length

    if (allSuccessful) {
        info(`✓ Successfully verified all ${sample.length} sample grants from Blob Storage`)
    } else {
        warn(`✗ Verification failed: ${successCount}/${sample.length} grants accessible`)
    }

    return allSuccessful
}
