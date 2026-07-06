/**
 * Parity check for the prepareGrants single-pass optimisation.
 *
 * Proves that `extractCheckboxAndPrefixFields` produces BYTE-IDENTICAL output to
 * the original per-field helpers it replaces (`convertCheckBoxFieldToArray` once
 * per checkbox field + `convertRawGrantKeyToValuesArray` once per prefix target),
 * so `grants.json.gz` and the Phase-3 content hashes cannot drift.
 *
 * Runs on hand-picked edge cases plus a seeded fuzz — no 1.1 GB dataset needed.
 * Run: npx tsc --project tsconfig-scripts.json && \
 *      node ./compiled-scripts/scripts/verify-prepare-grants-parity.js
 */
import { RawGrant } from './types/generate'
import {
    convertCheckBoxFieldToArray,
    convertRawGrantKeyToValuesArray,
    extractCheckboxAndPrefixFields,
} from './helpers/key-mapping'

const PREFIX_TARGETS = ['_pathogen__', '_diseases__', '_diseases_strains_']

// Checkbox fields, including the pathogen/disease/strain families (which ARE
// checkbox columns in the real data, so the checkbox and prefix predicates
// overlap on them — an important case to cover).
const CHECKBOX_FIELDS = [
    ...Array.from({ length: 12 }, (_, i) => `cbfield_${i}`),
    'families_pathogen',
    'host_diseases',
    'host_diseases_strains',
    'weird', // multi-`___` code segment case
]

// Codes chosen to exercise normaliseExtractedCode (leading `_` → `-`, ICTV → upper).
const CODES = ['ICTV1', 'ictv2', '_88', '_99', '_9999', 'np001', '12345', 'SNOMED9']

// Values chosen to exercise the predicate split:
//   checkbox uses `=== '1'`; prefix uses `value && parseInt(value) === 1`.
// So '1.0', ' 1', '01' are prefix-only; '2','10','0','' match neither.
const VALUES = ['1', '0', '', '1.0', ' 1', '01', '2', '10']

// ---- reference (old) path -------------------------------------------------
function reference(grant: RawGrant) {
    const checkBoxFieldValues: { [field: string]: string[] } = {}
    for (const field of CHECKBOX_FIELDS) {
        checkBoxFieldValues[field] = convertCheckBoxFieldToArray(grant, field)
    }
    const prefixValues: { [target: string]: string[] } = {}
    for (const target of PREFIX_TARGETS) {
        prefixValues[target] = convertRawGrantKeyToValuesArray(grant, target) as string[]
    }
    return { checkBoxFieldValues, prefixValues }
}

function candidate(grant: RawGrant) {
    return extractCheckboxAndPrefixFields(grant, CHECKBOX_FIELDS, PREFIX_TARGETS)
}

// ---- seeded RNG (reproducible) -------------------------------------------
function mulberry32(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function makeFuzzGrant(rand: () => number): RawGrant {
    const grant: RawGrant = {}
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]

    // Random cells across the checkbox fields (keys inserted in random order to
    // exercise key-iteration-order preservation).
    const cellCount = Math.floor(rand() * 40)
    for (let i = 0; i < cellCount; i++) {
        const field = pick(CHECKBOX_FIELDS)
        const code = pick(CODES)
        grant[`${field}___${code}`] = pick(VALUES)
    }

    // A multi-`___` code segment (split('___')[1] must be taken, not slice).
    if (rand() < 0.3) grant[`weird___seg1___seg2`] = pick(VALUES)

    // Filler non-checkbox keys (no `___`, and never containing a prefix target).
    const fillerCount = Math.floor(rand() * 6)
    for (let i = 0; i < fillerCount; i++) {
        grant[`text_field_${i}`] = pick(['', 'abc', '1', '0'])
    }
    return grant
}

const EDGE_GRANTS: RawGrant[] = [
    {},
    { text_field_0: 'abc', award_amount_converted: '123' },
    { 'families_pathogen___ICTV1': '1', 'families_pathogen___ictv2': '1.0' },
    { 'host_diseases____88': ' 1', 'host_diseases_strains___np001': '01' },
    { 'cbfield_0___ICTV1': '1', 'cbfield_0____99': '2', 'cbfield_0___ictv2': '1' },
    { 'weird___seg1___seg2': '1' },
]

// ---- run ------------------------------------------------------------------
function main() {
    const rand = mulberry32(1234567)
    const grants: RawGrant[] = [...EDGE_GRANTS]
    for (let i = 0; i < 5000; i++) grants.push(makeFuzzGrant(rand))

    let mismatches = 0
    grants.forEach((grant, i) => {
        const a = JSON.stringify(reference(grant))
        const b = JSON.stringify(candidate(grant))
        if (a !== b) {
            mismatches++
            if (mismatches <= 5) {
                console.error(`MISMATCH #${i}`)
                console.error(`  grant:     ${JSON.stringify(grant)}`)
                console.error(`  reference: ${a}`)
                console.error(`  candidate: ${b}`)
            }
        }
    })

    if (mismatches > 0) {
        console.error(`\n❌ ${mismatches}/${grants.length} grants mismatched.`)
        process.exit(1)
    }
    console.log(`✓ Parity OK — ${grants.length} grants, output byte-identical.`)
}

main()
