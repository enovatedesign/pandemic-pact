import { info, warn, error } from './helpers/log'

/**
 * Blocks until the deployment built from this commit is live.
 *
 * develop and master deploy by firing a Vercel deploy hook, which returns no URL
 * and builds asynchronously — so the smoke checks have to wait for the new build
 * rather than testing whatever is currently served.
 *
 * Identifies the build via public/data/build-manifest.json, written by
 * verify-build-artefacts at generate time.
 */

const POLL_INTERVAL_MS = 15_000
const DEFAULT_TIMEOUT_MS = 12 * 60 * 1000

interface Manifest {
    sha: string | null
    branch: string | null
    generatedAt: string
    counts: Record<string, number>
}

export async function waitForDeployment(
    baseUrl: string,
    expectedSha: string | undefined,
    notBefore: Date,
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Manifest> {
    const deadline = Date.now() + timeoutMs
    let lastReason = 'no response yet'

    while (Date.now() < deadline) {
        try {
            // Cache-bust: the manifest is a static file served from the CDN.
            const response = await fetch(`${baseUrl}/data/build-manifest.json?t=${Date.now()}`, {
                cache: 'no-store',
            })

            if (response.ok) {
                const manifest: Manifest = await response.json()

                if (expectedSha && manifest.sha) {
                    if (manifest.sha === expectedSha) {
                        info(`✓ Deployment for ${expectedSha.slice(0, 8)} is live`)
                        return manifest
                    }

                    lastReason = `serving ${manifest.sha.slice(0, 8)}, waiting for ${expectedSha.slice(0, 8)}`
                } else {
                    // Vercel may not populate VERCEL_GIT_COMMIT_SHA for deploy-hook
                    // deployments. Fall back to build recency.
                    const generatedAt = new Date(manifest.generatedAt)

                    if (generatedAt > notBefore) {
                        warn(`No commit SHA in the manifest — accepted on build time (${manifest.generatedAt})`)
                        return manifest
                    }

                    lastReason = `manifest built ${manifest.generatedAt}, older than this pipeline`
                }
            } else {
                lastReason = `${response.status} ${response.statusText}`
            }
        } catch (e) {
            lastReason = e instanceof Error ? e.message : String(e)
        }

        info(`Waiting for deployment — ${lastReason}`)
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    }

    throw new Error(`Timed out after ${timeoutMs / 1000}s waiting for the deployment — ${lastReason}`)
}

if (require.main === module) {
    const baseUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, '')

    if (!baseUrl) {
        error('SMOKE_BASE_URL is not set')
        process.exit(1)
    }

    // CI_JOB_STARTED_AT is ISO 8601; fall back to "some time ago" so a missing
    // value cannot make every manifest look too old.
    const notBefore = process.env.CI_JOB_STARTED_AT
        ? new Date(process.env.CI_JOB_STARTED_AT)
        : new Date(Date.now() - 30 * 60 * 1000)

    waitForDeployment(baseUrl, process.env.CI_COMMIT_SHA, notBefore).catch(e => {
        error(e instanceof Error ? e.message : String(e))
        process.exit(1)
    })
}
