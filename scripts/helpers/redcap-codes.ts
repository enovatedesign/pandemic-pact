import { warn, info } from './log'

/**
 * Recovers the canonical code behind a REDCap checkbox column-name segment.
 *
 * REDCap derives a checkbox column from a dictionary choice value by lowercasing
 * it and replacing every character outside [a-z0-9_] with '_':
 *
 *   442438000-01  ->  orthomyxoviridae_diseases___442438000_01
 *   H1N1          ->  orthomyxoviridae_diseases_strains___h1n1
 *   -88           ->  orthomyxoviridae_diseases____88
 *
 * That transform is lossy — '-' and ' ' both become '_', and case is destroyed —
 * so the segment cannot be reversed by rule alone. Guessing (e.g. "uppercase
 * anything matching /^h\d/") is how the previous ICTV-only special case ended up
 * missing `442438000-01`, `H1N1` and `D1`, leaving those codes unmatchable
 * against select-options, the filter hierarchy and the search index.
 *
 * Instead we index the dictionary's own choice values by their sanitised form and
 * look the canonical value straight back up. The dictionary is what select
 * options, `manual-hierarchy-filters.json` and the OpenSearch mapping are all
 * built from, so it is the definition of "correct" — and the index self-maintains
 * as the dictionary changes.
 *
 * The registry is dataset-scoped: `registerCanonicalCodes` replaces it wholesale,
 * so `prepareGrants` and `prepareTrials` each install their own dictionary before
 * streaming their records.
 */

type DictionaryRow = { [key: string]: string }

const CHOICES_COLUMN = 'Choices, Calculations, OR Slider Labels'
const FIELD_TYPE_COLUMN = 'Field Type'

let canonicalByColumnSegment = new Map<string, string>()
const unresolvedCodes = new Set<string>()

/**
 * The forward transform REDCap applies to a choice value to produce the segment
 * after `___` in a checkbox column name.
 */
export function sanitiseCodeAsRedcap(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

/**
 * Builds the sanitised -> canonical index from a REDCap data dictionary and
 * installs it as the active registry, replacing any previously registered one.
 *
 * Only checkbox rows are indexed: those are the only fields whose values reach
 * the data as column-name segments, so indexing the rest would widen the
 * collision surface for no gain.
 */
export function registerCanonicalCodes(dictionary: DictionaryRow[], label: string): void {
    const index = new Map<string, string>()
    const collisions: string[] = []

    for (const row of dictionary) {
        if (row[FIELD_TYPE_COLUMN] !== 'checkbox') {
            continue
        }

        const choices = row[CHOICES_COLUMN]?.trim()

        if (!choices) {
            continue
        }

        for (const choice of choices.split(' | ')) {
            const value = choice.split(',')[0].trim()

            if (!value) {
                continue
            }

            const segment = sanitiseCodeAsRedcap(value)
            const existing = index.get(segment)

            // Two different choice values sanitising to the same segment would make
            // the reverse lookup ambiguous — REDCap itself could not tell the two
            // apart either, so this is a dictionary problem worth surfacing loudly.
            if (existing !== undefined && existing !== value) {
                collisions.push(`${segment}: "${existing}" vs "${value}"`)
                continue
            }

            index.set(segment, value)
        }
    }

    if (collisions.length > 0) {
        warn(
            `${label}: ${collisions.length} ambiguous checkbox code(s) in the data ` +
                `dictionary; keeping the first of each — ${collisions.join('; ')}`,
        )
    }

    canonicalByColumnSegment = index
    unresolvedCodes.clear()

    info(`${label}: indexed ${index.size} checkbox codes from the data dictionary`)
}

/**
 * Clears the registry, so a later dataset can't silently inherit the previous
 * one's dictionary.
 */
export function clearCanonicalCodes(): void {
    canonicalByColumnSegment = new Map()
    unresolvedCodes.clear()
}

/**
 * Codes seen in the data that no registered dictionary choice accounts for.
 * Empty on both datasets today; a non-empty list means the data and the
 * dictionary have drifted apart and some filter/label will be dead.
 */
export function getUnresolvedCodes(): string[] {
    return Array.from(unresolvedCodes).sort()
}

/**
 * Warns about any code the registered dictionary could not account for. Call
 * after a dataset's records have been transformed. Silent when there are none,
 * which is the expected state.
 */
export function reportUnresolvedCodes(label: string): void {
    const unresolved = getUnresolvedCodes()

    if (unresolved.length === 0) {
        return
    }

    warn(
        `${label}: ${unresolved.length} checkbox code(s) in the data have no ` +
            `matching data dictionary choice, so their filters and labels will be ` +
            `dead — ${unresolved.join(', ')}`,
    )
}

/**
 * Resolves a checkbox column-name segment to its canonical dictionary value.
 *
 * Falls back to the pre-registry rules when the segment is unknown — or when no
 * dictionary has been registered at all, as in the standalone parity check — so
 * a dictionary/data drift degrades to the old behaviour rather than breaking the
 * build. Unresolved segments are recorded for `getUnresolvedCodes`.
 */
export function resolveCanonicalCode(segment: string): string {
    const canonical = canonicalByColumnSegment.get(segment)

    if (canonical !== undefined) {
        return canonical
    }

    if (canonicalByColumnSegment.size > 0) {
        unresolvedCodes.add(segment)
    }

    // Legacy rules: a leading '_' encodes a minus sign (-88/-99/-9999), and ICTV
    // codes are stored uppercase in the dictionary.
    const value = segment.replace(/^_/, '-')

    return value.toLowerCase().startsWith('ictv') ? value.toUpperCase() : value
}
