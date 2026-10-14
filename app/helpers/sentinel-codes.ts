/**
 * REDCap's negative "missing data" codes, shared by every Pandemic PACT dataset.
 * Used at build time to repair dictionary choices whose label is just the code
 * (e.g. `-99, -99` on the month fields) and at render time as the last resort
 * before a raw code would otherwise be shown.
 */
export const SENTINEL_LABELS: Record<string, string> = {
    '-77': 'Pending',
    '-88': 'Other',
    '-99': 'Unspecified',
    '-9999': 'Not applicable',
}

const SENTINEL_PATTERN = /^-\d+$/

export const isSentinelCode = (value: unknown): boolean =>
    SENTINEL_PATTERN.test(String(value ?? '').trim())

/**
 * The display label for a coded value, given a code -> label map or the label
 * already looked up. An unknown negative code still reads as "Unspecified"
 * rather than leaking the number; the build reports it separately (see
 * scripts/helpers/redcap-codes.ts) so the gap gets fixed at source.
 */
export function labelForCode(
    code: string,
    labels?: Record<string, string | undefined> | string,
): string {
    const trimmed = String(code ?? '').trim()
    const label =
        typeof labels === 'object' && labels !== null ? labels[trimmed] : labels

    if (label && !isSentinelCode(label)) {
        return label
    }

    if (isSentinelCode(trimmed)) {
        return SENTINEL_LABELS[trimmed] ?? SENTINEL_LABELS['-99']
    }

    return label ?? trimmed
}
