import fs from 'fs-extra'
import path from 'path'
import { title, info, warn, error } from './helpers/log'
import {
    grantsFilterableFields,
    grantsNonFilterableSelectOptions,
    clinicalTrialsFilterableFields,
} from '../app/helpers/filterable-fields'

/**
 * Post-generate assertions on the files the frontend fetches at runtime.
 *
 * Runs at the end of `npm run generate`, so it covers the cached and full build
 * paths alike and aborts `next build` before a deployment can ship without them.
 * A missing artefact is otherwise invisible: pages still return 200, exports
 * fail only on click, and empty datasets render fallback charts that look real.
 */

/** Set to skip verification locally when a dataset was intentionally not built. */
const SKIP = process.env.SKIP_ARTEFACT_VERIFICATION === 'true'

const MANIFEST_PATH = './public/data/build-manifest.json'

interface CsvSpec {
    path: string
    /**
     * The id column. filterCsv() matches rows with `line.startsWith(id + ',')`,
     * so a CSV whose id is not the first column silently filters to nothing —
     * only the clinical-trials export forces the position via `idField`.
     */
    idField: string
    minRows: number
    maxBytes: number
    /** Skipped when the clinical-trials pipeline bailed out — see verifyBuildArtefacts. */
    clinicalTrials?: boolean
}

interface JsonSpec {
    path: string
    minRecords: number
    clinicalTrials?: boolean
}

const csvSpecs: CsvSpec[] = [
    {
        path: './public/export/grants/pandemic-pact-grants.csv',
        idField: 'GrantID',
        minRows: 25000,
        maxBytes: 150 * 1024 * 1024,
    },
    {
        path: './public/export/clinical-trials/pandemic-pact-clinical-trials.csv',
        idField: 'TrialID',
        minRows: 1000,
        maxBytes: 50 * 1024 * 1024,
        clinicalTrials: true,
    },
    {
        path: './public/export/rrna/pandemic-pact-rrna-studies.csv',
        idField: 'Rrnaid',
        minRows: 1000,
        maxBytes: 50 * 1024 * 1024,
    },
    {
        path: './public/export/100-days-mission/100-days-mission-grants.csv',
        idField: 'GrantID',
        minRows: 2500,
        maxBytes: 50 * 1024 * 1024,
    },
    {
        path: './public/export/pandemic-intelligence/pandemic-intelligence-grants.csv',
        idField: 'GrantID',
        minRows: 400,
        maxBytes: 50 * 1024 * 1024,
    },
]

const jsonSpecs: JsonSpec[] = [
    { path: './public/data/grants.json', minRecords: 25000 },
    { path: './public/data/grant-ids.json', minRecords: 25000 },
    { path: './public/data/clinical-trials/trials.json', minRecords: 1000, clinicalTrials: true },
    { path: './public/data/rrna/studies.json', minRecords: 1000 },
    { path: './public/data/100-days-mission/grants.json', minRecords: 2500 },
    { path: './public/data/pandemic-intelligence/grants.json', minRecords: 400 },
]

const selectOptionsSpecs = [
    {
        path: './data/dist/select-options.json',
        minKeys: 30,
        filterableFields: grantsFilterableFields,
        exempt: [...grantsNonFilterableSelectOptions, 'GrantID'],
        label: 'grants',
    },
    {
        path: './data/dist/clinical-trials/select-options.json',
        minKeys: 20,
        filterableFields: clinicalTrialsFilterableFields,
        exempt: ['TrialID'],
        label: 'clinical trials',
        clinicalTrials: true,
    },
]

/** Counts newlines without holding the file in memory — the grants CSV is >100 MB. */
function countLines(pathname: string): Promise<number> {
    return new Promise((resolve, reject) => {
        let count = 0
        let lastByte = 0

        fs.createReadStream(pathname)
            .on('data', (chunk: Buffer) => {
                for (let i = 0; i < chunk.length; i++) {
                    if (chunk[i] === 0x0a) count++
                }
                if (chunk.length > 0) lastByte = chunk[chunk.length - 1]
            })
            .on('end', () => resolve(lastByte === 0x0a ? count : count + 1))
            .on('error', reject)
    })
}

function readFirstLine(pathname: string): string {
    const buffer = Buffer.alloc(64 * 1024)
    const handle = fs.openSync(pathname, 'r')

    try {
        const bytesRead = fs.readSync(handle, buffer, 0, buffer.length, 0)
        const text = buffer.subarray(0, bytesRead).toString('utf-8')
        return text.split(/\r?\n/)[0]
    } finally {
        fs.closeSync(handle)
    }
}

async function verifyCsv(spec: CsvSpec, failures: string[], counts: Record<string, number>) {
    if (!fs.existsSync(spec.path)) {
        failures.push(
            `${spec.path} is missing. The frontend fetches this on the export button; without it the download silently fails.`,
        )
        return
    }

    const { size } = fs.statSync(spec.path)

    if (size === 0) {
        failures.push(`${spec.path} is empty.`)
        return
    }

    if (size > spec.maxBytes) {
        failures.push(
            `${spec.path} is ${(size / 1024 / 1024).toFixed(1)} MB, over the ${(spec.maxBytes / 1024 / 1024).toFixed(0)} MB budget. The filtered-export button loads the whole file into browser memory.`,
        )
    }

    const header = readFirstLine(spec.path)

    if (header.startsWith('<')) {
        failures.push(`${spec.path} starts with "<" — an HTML error page was written in place of the CSV.`)
        return
    }

    const firstColumn = header.split(',')[0].replace(/^"|"$/g, '')

    if (firstColumn !== spec.idField) {
        failures.push(
            `${spec.path} has "${firstColumn}" as its first column, expected "${spec.idField}". filterCsv() matches rows on the first column, so filtered exports would return only a header row.`,
        )
    }

    const rows = (await countLines(spec.path)) - 1
    counts[path.basename(spec.path)] = rows

    if (rows < spec.minRows) {
        failures.push(`${spec.path} has ${rows} rows, expected at least ${spec.minRows}.`)
    }

    info(`✓ ${spec.path} — ${rows} rows, ${(size / 1024 / 1024).toFixed(1)} MB`)
}

function verifyJson(spec: JsonSpec, failures: string[], counts: Record<string, number>) {
    if (!fs.existsSync(spec.path)) {
        failures.push(`${spec.path} is missing. The page that fetches it renders fallback data rather than failing.`)
        return
    }

    let parsed: unknown

    try {
        parsed = fs.readJsonSync(spec.path)
    } catch (e) {
        failures.push(`${spec.path} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`)
        return
    }

    if (!Array.isArray(parsed)) {
        failures.push(`${spec.path} is not an array.`)
        return
    }

    counts[spec.path.replace('./public/data/', '')] = parsed.length

    if (parsed.length < spec.minRecords) {
        failures.push(
            `${spec.path} has ${parsed.length} records, expected at least ${spec.minRecords}. Charts render plausible-looking fallback data when a dataset is empty, so this will not look broken in the UI.`,
        )
        return
    }

    info(`✓ ${spec.path} — ${parsed.length} records`)
}

function verifySelectOptions(failures: string[], clinicalTrialsGenerated: boolean) {
    selectOptionsSpecs.forEach(spec => {
        if (spec.clinicalTrials && !clinicalTrialsGenerated) {
            return
        }

        if (!fs.existsSync(spec.path)) {
            failures.push(`${spec.path} is missing.`)
            return
        }

        const options = fs.readJsonSync(spec.path)
        const keys = Object.keys(options)

        if (keys.length < spec.minKeys) {
            failures.push(`${spec.path} has ${keys.length} keys, expected at least ${spec.minKeys}.`)
        }

        // A filterable field with no select options is not indexed, so the filter
        // matches nothing — prepareFilterClause drops unknown fields without error.
        const missing = spec.filterableFields.filter(
            field => !spec.exempt.includes(field) && !keys.includes(field),
        )

        if (missing.length > 0) {
            failures.push(
                `${spec.label}: filterable fields with no select options — ${missing.join(', ')}. These filters would silently match nothing.`,
            )
        }

        info(`✓ ${spec.path} — ${keys.length} keys`)
    })
}

function verifyHomepageTotals(
    failures: string[],
    counts: Record<string, number>,
    clinicalTrialsGenerated: boolean,
) {
    const pathname = './data/dist/homepage-totals.json'

    if (!fs.existsSync(pathname)) {
        failures.push(`${pathname} is missing.`)
        return
    }

    const totals = fs.readJsonSync(pathname)
    const required = ['totalCommittedUsd', 'totalGrants', 'totalFunders']

    if (clinicalTrialsGenerated) {
        required.push('totalClinicalTrials')
    }
    const missing = required.filter(key => !(key in totals))

    if (missing.length > 0) {
        failures.push(
            `${pathname} is missing ${missing.join(', ')}. totalClinicalTrials is absent whenever the clinical-trials pipeline bails out, and the homepage types it optional so nothing throws.`,
        )
        return
    }

    counts.totalGrants = totals.totalGrants?.finalCount ?? 0
    counts.totalClinicalTrials = totals.totalClinicalTrials?.finalCount ?? 0

    info(`✓ ${pathname} — ${required.length} totals present`)
}

function writeManifest(counts: Record<string, number>) {
    const manifest = {
        sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.CI_COMMIT_SHA ?? null,
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.CI_COMMIT_REF_NAME ?? null,
        generatedAt: new Date().toISOString(),
        counts,
    }

    fs.ensureDirSync(path.dirname(MANIFEST_PATH))
    fs.writeJsonSync(MANIFEST_PATH, manifest, { spaces: 2 })

    info(`✓ Wrote ${MANIFEST_PATH}`)
}

/**
 * @param clinicalTrialsGenerated Whether the clinical-trials pipeline produced
 * (or restored) its artefacts. It returns false and writes nothing when there is
 * no Figshare token and no cache to restore — a deliberate soft skip, so the CT
 * assertions are skipped too rather than failing an otherwise valid build.
 */
export default async function verifyBuildArtefacts(clinicalTrialsGenerated = true) {
    title('Verifying build artefacts')

    if (SKIP) {
        warn('SKIP_ARTEFACT_VERIFICATION is set — skipping artefact verification')
        return
    }

    if (!clinicalTrialsGenerated) {
        warn('Clinical trials were not generated on this build — skipping their artefact checks')
    }

    const failures: string[] = []
    const counts: Record<string, number> = {}

    for (const spec of csvSpecs) {
        if (spec.clinicalTrials && !clinicalTrialsGenerated) continue
        await verifyCsv(spec, failures, counts)
    }

    jsonSpecs.forEach(spec => {
        if (spec.clinicalTrials && !clinicalTrialsGenerated) return
        verifyJson(spec, failures, counts)
    })

    verifySelectOptions(failures, clinicalTrialsGenerated)
    verifyHomepageTotals(failures, counts, clinicalTrialsGenerated)

    if (failures.length > 0) {
        error(`\n${failures.length} build artefact check(s) failed:\n`)
        failures.forEach(failure => error(`  ✗ ${failure}`))

        throw new Error(
            `${failures.length} build artefact check(s) failed — see above. Set SKIP_ARTEFACT_VERIFICATION=true to bypass locally.`,
        )
    }

    writeManifest(counts)

    info('\n✓ All build artefact checks passed')
}

// Allow running standalone: node ./compiled-scripts/scripts/verify-build-artefacts.js
if (require.main === module) {
    verifyBuildArtefacts().catch(e => {
        error(e instanceof Error ? e.message : String(e))
        process.exit(1)
    })
}
