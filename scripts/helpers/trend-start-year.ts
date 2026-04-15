// Resolves the `TrendStartYear` we stamp onto processed grants.
//
// Prefers `grant_start_year` when it's a valid year on or after 2020, otherwise
// falls back to `publication_year_of_award`. Returns `null` when neither field
// yields a usable year.
//
// Note: a plain `??` fallback is not enough here because the source data
// frequently uses empty strings rather than null/undefined for missing years,
// and `Number('')` is `0` (not `NaN`), which would otherwise leak through as a
// bogus year 0 and be silently dropped by downstream `>= 2020` filters.

const toValidYear = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null
    const n = Number(value)
    if (Number.isNaN(n) || n <= 0) return null
    return n
}

export function resolveTrendStartYear(rawGrant: {
    grant_start_year?: unknown
    publication_year_of_award?: unknown
}): number | null {
    const rawStartYear = toValidYear(rawGrant.grant_start_year)
    const rawPublicationYear = toValidYear(rawGrant.publication_year_of_award)

    return rawStartYear !== null && rawStartYear >= 2020
        ? rawStartYear
        : rawPublicationYear
}
