import { title, info, error } from './helpers/log'
import { waitForDeployment } from './wait-for-deployment'

/**
 * Post-deploy checks against a live deployment.
 *
 * Deliberately HTTP-only and fast — the browser-level checks live in
 * tests/e2e/. Everything here is a failure that returns HTTP 200 somewhere in
 * the UI: a missing export, an empty dataset behind a chart that renders
 * fallback data, a search API returning 503 into a client that does not check.
 */

const EXPORT_CSVS = [
    'grants/pandemic-pact-grants.csv',
    'clinical-trials/pandemic-pact-clinical-trials.csv',
    'rrna/pandemic-pact-rrna-studies.csv',
    '100-days-mission/100-days-mission-grants.csv',
    'pandemic-intelligence/pandemic-intelligence-grants.csv',
]

const MIN_COUNTS: Record<string, number> = {
    'grants.json': 25000,
    'grant-ids.json': 25000,
    'clinical-trials/trials.json': 1000,
    'rrna/studies.json': 1000,
    '100-days-mission/grants.json': 2500,
    'pandemic-intelligence/grants.json': 400,
}

const failures: string[] = []

function fail(message: string) {
    failures.push(message)
    error(`  ✗ ${message}`)
}

function pass(message: string) {
    info(`  ✓ ${message}`)
}

async function checkExportCsvs(baseUrl: string) {
    title('Export CSVs')

    for (const file of EXPORT_CSVS) {
        const url = `${baseUrl}/export/${file}`

        // One ranged GET gives status, content-type, total size and the header
        // row. The grants CSV is >100 MB and must never be downloaded in full —
        // and note undici strips content-length from HEAD responses, so a HEAD
        // cannot be used to size the file.
        const response = await fetch(url, { headers: { Range: 'bytes=0-2047' } })

        if (!response.ok) {
            await response.body?.cancel()
            fail(`${url} returned ${response.status} ${response.statusText}`)
            continue
        }

        const contentType = response.headers.get('content-type') ?? ''

        if (!contentType.includes('csv')) {
            await response.body?.cancel()
            fail(`${url} has content-type "${contentType}", expected text/csv`)
            continue
        }

        if (response.status !== 206) {
            // Range ignored — the body is the whole file, so discard it unread.
            await response.body?.cancel()
            pass(`${file} — served, but range requests are unsupported so size and header were not checked`)
            continue
        }

        // "bytes 0-2047/2086662" — the total is "*" when the server does not know
        // it, so only assert on a size we actually parsed.
        const total = response.headers.get('content-range')?.split('/')[1]
        const size = Number(total)
        const knownSize = total !== undefined && total !== '*' && Number.isFinite(size)

        const header = (await response.text()).split(/\r?\n/)[0]

        if (header.startsWith('<')) {
            fail(`${url} returned HTML, not CSV`)
            continue
        }

        if (knownSize && size < 1024) {
            fail(`${url} is only ${size} bytes`)
            continue
        }

        const reportedSize = knownSize ? `${(size / 1024 / 1024).toFixed(1)} MB` : 'size unknown'

        pass(`${file} — ${reportedSize}, first column "${header.split(',')[0]}"`)
    }
}

function checkManifestCounts(counts: Record<string, number>) {
    title('Dataset volumes')

    Object.entries(MIN_COUNTS).forEach(([key, min]) => {
        const actual = counts[key]

        if (actual === undefined) {
            fail(`build-manifest.json has no count for ${key}`)
            return
        }

        if (actual < min) {
            fail(`${key} has ${actual} records, expected at least ${min}`)
            return
        }

        pass(`${key} — ${actual} records`)
    })
}

async function checkSearchApi(baseUrl: string) {
    title('Search API')

    const datasets = [
        { name: 'grants', key: 'grantIDs' },
        { name: 'clinical-trials', key: 'trialIDs' },
    ]

    for (const dataset of datasets) {
        const url = `${baseUrl}/api/search/${dataset.name}/list`

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                q: '',
                filters: { logicalAnd: false, filters: [] },
                page: 1,
                limit: 10,
            }),
        })

        if (response.status === 503) {
            await response.body?.cancel()
            fail(`${url} returned 503 — the search client is unavailable (missing SEARCH_* env vars)`)
            continue
        }

        if (!response.ok) {
            await response.body?.cancel()
            fail(`${url} returned ${response.status} ${response.statusText}`)
            continue
        }

        const body = await response.json()
        const total = body?.hits?.total?.value ?? body?.total?.value ?? 0

        if (total < 1) {
            fail(`${url} returned ${total} results for an empty query — the index is empty or misnamed`)
            continue
        }

        pass(`${dataset.name} search — ${total} results`)
    }
}

async function checkPages(baseUrl: string) {
    title('Pages and redirects')

    const pages = [
        '/',
        '/grants/explore',
        '/grants/visualise',
        '/clinical-trials/explore',
        '/clinical-trials/visualise',
        '/sitemap.xml',
    ]

    for (const page of pages) {
        const response = await fetch(`${baseUrl}${page}`)

        // Undici holds the socket until the body is read or cancelled, which
        // would keep the process alive well past the last check.
        await response.body?.cancel()

        if (!response.ok) {
            fail(`${page} returned ${response.status} ${response.statusText}`)
            continue
        }

        pass(`${page} — ${response.status}`)
    }

    const redirects: [string, string][] = [
        ['/grants', '/grants/explore'],
        ['/visualise', '/grants/visualise'],
    ]

    for (const [from, to] of redirects) {
        const response = await fetch(`${baseUrl}${from}`, { redirect: 'manual' })
        const location = response.headers.get('location') ?? ''

        await response.body?.cancel()

        if (!location.endsWith(to)) {
            fail(`${from} redirected to "${location}", expected ${to}`)
            continue
        }

        pass(`${from} → ${to}`)
    }
}

async function checkDetailPages(baseUrl: string) {
    title('Detail pages')

    // Per-record JSON files are generated on the full build path only and served
    // from S3 via a rewrite, so they can go missing while every other page is fine.
    const response = await fetch(`${baseUrl}/data/grant-ids.json`)

    if (!response.ok) {
        await response.body?.cancel()
        fail(`/data/grant-ids.json returned ${response.status} — cannot sample a detail page`)
        return
    }

    const ids: string[] = await response.json()

    if (ids.length === 0) {
        fail('/data/grant-ids.json is empty')
        return
    }

    // Sample a few rather than the first, which could be special-cased.
    const sample = [ids[0], ids[Math.floor(ids.length / 2)], ids[ids.length - 1]]

    for (const id of sample) {
        const page = await fetch(`${baseUrl}/grants/${id}`)

        await page.body?.cancel()

        if (page.status === 404) {
            fail(`/grants/${id} returned 404 — the per-grant JSON files are missing from this deployment`)
            continue
        }

        if (!page.ok) {
            fail(`/grants/${id} returned ${page.status} ${page.statusText}`)
            continue
        }

        pass(`/grants/${id} — ${page.status}`)
    }
}

async function main() {
    const baseUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, '')

    if (!baseUrl) {
        throw new Error('SMOKE_BASE_URL is not set')
    }

    info(`Smoke testing ${baseUrl}`)

    const notBefore = process.env.CI_JOB_STARTED_AT
        ? new Date(process.env.CI_JOB_STARTED_AT)
        : new Date(Date.now() - 30 * 60 * 1000)

    // SKIP_DEPLOYMENT_WAIT is set for feature branches, where `vercel deploy` has
    // already returned a live URL and there is nothing to wait for.
    let counts: Record<string, number> = {}

    if (process.env.SKIP_DEPLOYMENT_WAIT === 'true') {
        const response = await fetch(`${baseUrl}/data/build-manifest.json?t=${Date.now()}`)

        if (response.ok) {
            counts = (await response.json()).counts ?? {}
        } else {
            // Report and carry on: the remaining checks are still worth running.
            fail(`/data/build-manifest.json returned ${response.status} — this build predates artefact verification`)
        }
    } else {
        counts = (await waitForDeployment(baseUrl, process.env.CI_COMMIT_SHA, notBefore)).counts ?? {}
    }

    checkManifestCounts(counts)

    await checkExportCsvs(baseUrl)
    await checkSearchApi(baseUrl)
    await checkPages(baseUrl)
    await checkDetailPages(baseUrl)

    if (failures.length > 0) {
        error(`\n${failures.length} smoke check(s) failed against ${baseUrl}`)
        process.exit(1)
    }

    info('\n✓ All smoke checks passed')
}

main().catch(e => {
    error(e instanceof Error ? e.message : String(e))
    process.exit(1)
})
