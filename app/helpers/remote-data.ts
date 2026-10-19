import { normaliseBranchName } from './normalise-branch-name'

/**
 * Get branch name for runtime remote storage paths
 */
export const getBranchNameForRuntime = (): string => {
    // Prefer the non-public system vars: these are available at runtime on the
    // server and mirror the build-time upload helper (getBranchName()).
    // The NEXT_PUBLIC_* copies are only inlined when VERCEL_GIT_COMMIT_REF is set
    // at build time, so they're unreliable for redeploys (which leave them empty
    // and cause a fall back to "master" → 404).
    const ciBranch =
        process.env.CI_COMMIT_REF_NAME ||
        process.env.VERCEL_GIT_COMMIT_REF ||
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
        process.env.NEXT_PUBLIC_CI_COMMIT_REF_NAME ||
        null

    if (!ciBranch) {
        console.warn('No branch environment variable found, defaulting to "master"')
        return 'master'
    }

    return normaliseBranchName(ciBranch)
}

let warnedNoDeploymentId = false

/**
 * Fetch a JSON object from S3/CloudFront, cached for the life of the deployment.
 * The deployment ID is in the cache key because the Data Cache outlives deploys
 * while `generate` overwrites the same URLs. Only a missing object returns null:
 * other failures throw so the page errors instead of caching a 404 until the next deploy.
 */
export const fetchRemoteJson = async (url: string): Promise<any | null> => {
    const deploymentId = process.env.VERCEL_DEPLOYMENT_ID

    if (!deploymentId && !warnedNoDeploymentId) {
        warnedNoDeploymentId = true
        console.warn('VERCEL_DEPLOYMENT_ID not set: remote data is cached across deploys and may serve stale JSON')
    }

    const cacheKeyedUrl = deploymentId ? `${url}?v=${encodeURIComponent(deploymentId)}` : url

    const response = await fetch(cacheKeyedUrl, { cache: 'force-cache' })

    // S3 answers 403, not 404, for a missing key when the reader can't list the bucket.
    if (response.status === 404 || response.status === 403) return null

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    return response.json()
}
