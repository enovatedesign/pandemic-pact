/**
 * Shared PubMed grant ID helpers.
 *
 * Single source of truth for filename encoding, ID splitting, and validation
 * used by both the Next.js app and build scripts.
 */

/**
 * Encode a PubMed grant ID into a safe filename.
 * Slashes become double underscores, spaces become single underscores.
 */
export function pubmedFileName(id: string): string {
    return id.replace(/\//g, '__').replace(/ /g, '_')
}

/**
 * Split a raw PubMedGrantId field on commas, semicolons, or multiple spaces.
 * A single grant record may reference multiple PubMed grant IDs.
 */
export function splitGrantIds(id: string): string[] {
    return id.split(/[,;]|\s{2,}/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
}

/**
 * Check whether a string is a plausible PubMed grant ID.
 */
export function idIsValidPubMedGrantId(id?: string): boolean {
    if (typeof id !== 'string') return false

    const normalised = id.trim().toLowerCase()

    if (['', 'unknown', 'not applicable', 'n/a'].includes(normalised)) return false
    if (id.trim().length > 45) return false
    if (/\s{2,}/.test(id.trim())) return false

    return true
}
