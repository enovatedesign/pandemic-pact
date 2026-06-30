import { info, warn } from './log'
import { getBranchName } from './get-branch-name'
import { assetBaseUrl } from './s3-client'

/**
 * Verifies that a sample of grant files are accessible from S3 (via CloudFront).
 * Mirrors verifyBlobGrants. Throws if not all sampled grants are accessible.
 */
export async function verifyGrantsS3(
    grantIds: string[],
    sampleSize: number = 50,
): Promise<boolean> {
    const baseUrl = assetBaseUrl()
    const branchName = getBranchName()

    const shuffled = [...grantIds].sort(() => Math.random() - 0.5)
    const sample = shuffled.slice(0, Math.min(sampleSize, grantIds.length))

    info(`Verifying ${sample.length} sample grants from S3 for branch "${branchName}"...`)

    const results = await Promise.all(
        sample.map(async id => {
            try {
                const url = `${baseUrl}/${branchName}/grants/${id}.json`
                const response = await fetch(url)

                if (!response.ok) {
                    warn(`Failed to fetch grant ${id}: ${response.status} ${response.statusText}`)
                    return false
                }

                await response.json()
                return true
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                warn(`Error verifying grant ${id}: ${message}`)
                return false
            }
        }),
    )

    const successCount = results.filter(Boolean).length
    const allSuccessful = successCount === sample.length

    if (allSuccessful) {
        info(`✓ Successfully verified all ${sample.length} sample grants from S3`)
    } else {
        throw new Error(
            `S3 verification failed: only ${successCount}/${sample.length} sample grants accessible. ` +
            `Some grant files may be missing from S3.`,
        )
    }

    return allSuccessful
}
