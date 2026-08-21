import { isPlainObject } from 'lodash'

// Search helpers for the Clinical Research Registrations (ICTRP) explore page.
// Mirrors app/helpers/search.ts but targets the clinical-trials index and drops
// the grants-only concepts (joint funding, grant amounts, publications).

export interface CtFilter {
    field: string
    values: string[]
    logicalAnd: boolean
}

export interface CtSearchFilters {
    logicalAnd: boolean
    filters: CtFilter[]
}

/** Standard (simple) filters: a map of CT field -> selected option codes. */
export type CtStandardFilters = Record<string, string[]>

/**
 * Multi-country filter values. The CT analogue of the grants joint-funding
 * filter: a multi-country trial is one conducted across more than one country.
 * It is determined independently for research location and research institution
 * (Technical Spec §6.1), each backed by its own precomputed flag (see
 * scripts/generate/prepare-trials-search.ts). The values still read
 * "co-located" — the term the UI used originally — because they are part of the
 * shareable Explore URL and the Viz 1 map deep-links against them. This array is
 * the canonical value set used for request validation; the UI labels come from
 * coLocatedFilterOptionsFor() so each dropdown names its geography.
 */
export const coLocatedFilterOptions = [
    { label: 'All Clinical Trials', value: 'all-trials' },
    { label: 'Only Multi-country Clinical Trials', value: 'only-co-located-trials' },
    { label: 'Exclude Multi-country Clinical Trials', value: 'exclude-co-located-trials' },
]

/**
 * Field-specific co-located options for the Explore dropdowns. The values match
 * coLocatedFilterOptions; only the labels vary. Every label leads with its
 * geography: the two dropdowns sit side by side and Select only ever shows the
 * selected option's label, so anything they share up front makes them
 * indistinguishable until the string is read to the end. Labels say
 * "multi-country" rather than "co-located" because that is literally what the
 * flag records — more than one country in that field.
 */
export function coLocatedFilterOptionsFor(geography: string) {
    return [
        { label: `${geography}: All Clinical Trials`, value: 'all-trials' },
        { label: `${geography}: Only Multi-country Clinical Trials`, value: 'only-co-located-trials' },
        { label: `${geography}: Exclude Multi-country Clinical Trials`, value: 'exclude-co-located-trials' },
    ]
}

export interface CtAdvancedSearchRow {
    key: string
    field: string
    values: string[]
    logicalAnd: boolean
}

export interface CtAdvancedSearchState {
    rows: CtAdvancedSearchRow[]
    logicalAnd: boolean
    /** Monotonic source of row keys, so they stay unique across a stored state. */
    nextRowKey: number
}

export interface CtSearchParameters {
    q: string
    standardFilters: CtStandardFilters
    // Co-location is tracked independently for research location and research
    // institution (Technical Spec §6.1 — treated independently, no fallback).
    coLocatedLocation: string
    coLocatedInstitution: string
    /**
     * The advanced search is held as its row model rather than the derived API
     * filters: the filters are lossy (empty rows, the chosen field before its
     * values, the global and/or) and can't rebuild the UI on restore.
     */
    advancedSearch: CtAdvancedSearchState
    showAdvancedSearch: boolean
    page: number
    limit: number
}

export interface CtSearchResult {
    _index: string
    _id: string
    _score: number
    _source: {
        TrialTitle: string
        TrialNumber: string
        Register: string
        RegistrationYear: string
        Diseases: string[]
        SourceLink: string
        RecruitmentStatus: string
        StudyType: string
    }
    highlight?: {
        TrialTitle?: string[]
        TrialTitleScientific?: string[]
        TrialTitlePublic?: string[]
    }
}

export interface CtSearchResponse {
    hits: CtSearchResult[]
    query: string
    total: {
        value: number
    }
}

export interface CtSearchRequestBody {
    q: string
    filters: CtSearchFilters
    coLocatedLocation?: string
    coLocatedInstitution?: string
    page?: number
    limit?: number
}

const DEFAULT_ADVANCED_SEARCH_FIELDS = ['Diseases']

export function emptyCtAdvancedSearchRow(
    field: string,
    key: number,
): CtAdvancedSearchRow {
    return { key: `row-${key}`, field, values: [], logicalAnd: false }
}

export function defaultCtAdvancedSearchState(): CtAdvancedSearchState {
    return {
        rows: DEFAULT_ADVANCED_SEARCH_FIELDS.map(emptyCtAdvancedSearchRow),
        logicalAnd: true,
        nextRowKey: DEFAULT_ADVANCED_SEARCH_FIELDS.length,
    }
}

/** Derive the filter payload the API expects from the advanced search rows. */
export function buildCtAdvancedSearchFilters(
    state: CtAdvancedSearchState,
): CtSearchFilters {
    return {
        logicalAnd: state.logicalAnd,
        filters: state.rows
            .filter(row => row.field && row.values.length > 0)
            .map(({ field, values, logicalAnd }) => ({
                field,
                values,
                logicalAnd,
            })),
    }
}

export function defaultCtSearchParameters(): CtSearchParameters {
    return {
        q: '',
        standardFilters: {},
        coLocatedLocation: 'all-trials',
        coLocatedInstitution: 'all-trials',
        advancedSearch: defaultCtAdvancedSearchState(),
        showAdvancedSearch: false,
        page: 1,
        limit: 25,
    }
}

/** Query string parameters that seed the page and are then stripped from the URL. */
export const DEEP_LINK_PARAMETERS = [
    'q',
    'filters',
    'coLocatedLocation',
    'coLocatedInstitution',
]

/**
 * State arriving from outside the page — the geographic distribution
 * visualisation's `?filters=` links and the trial page's `?q=` back link. A deep
 * link replaces any stored state rather than merging with it, so the link lands
 * on exactly what it describes.
 */
export function searchParametersFromDeepLink(
    searchParams: URLSearchParams,
): CtSearchParameters | null {
    const query = searchParams.get('q')
    const filters = searchParams.get('filters')

    const coLocated = {
        coLocatedLocation: searchParams.get('coLocatedLocation'),
        coLocatedInstitution: searchParams.get('coLocatedInstitution'),
    }

    const coLocatedIsSet = Object.values(coLocated).some(Boolean)

    if (!query && !filters && !coLocatedIsSet) {
        return null
    }

    const parameters = defaultCtSearchParameters()

    if (query) {
        parameters.q = query
    }

    Object.entries(coLocated).forEach(([key, value]) => {
        if (coLocatedFilterOptions.some(option => option.value === value)) {
            parameters[key as 'coLocatedLocation' | 'coLocatedInstitution'] =
                value as string
        }
    })

    if (filters) {
        try {
            parameters.standardFilters = JSON.parse(filters)
        } catch {
            // A malformed link shouldn't blank the page.
        }
    }

    return parameters
}

/**
 * Rebuild search parameters from storage or a share link. Anything missing or
 * malformed falls back to its default rather than reaching the selects. Whether
 * the filters it names still exist is a separate question, answered by
 * pruneCtSearchParameters (kept in its own module, so this one stays free of
 * the filter schema and safe to import from the search API routes).
 */
export function restoreCtSearchParameters(
    restored: any,
    isReturnVisit: boolean = false,
): CtSearchParameters {
    const defaults = defaultCtSearchParameters()

    if (!isPlainObject(restored)) {
        return defaults
    }

    const coLocated = (value: any, fallback: string) =>
        coLocatedFilterOptions.some(option => option.value === value)
            ? (value as string)
            : fallback

    return {
        ...defaults,
        ...restored,
        standardFilters: isPlainObject(restored.standardFilters)
            ? restored.standardFilters
            : defaults.standardFilters,
        advancedSearch: Array.isArray(restored.advancedSearch?.rows)
            ? { ...defaults.advancedSearch, ...restored.advancedSearch }
            : defaults.advancedSearch,
        coLocatedLocation: coLocated(
            restored.coLocatedLocation,
            defaults.coLocatedLocation,
        ),
        coLocatedInstitution: coLocated(
            restored.coLocatedInstitution,
            defaults.coLocatedInstitution,
        ),
        // A fresh visit opens on the first page however deep the stored state,
        // but a back or forward is a return to results already being read.
        page: isReturnVisit ? restoredPage(restored.page) : 1,
    }
}

function restoredPage(page: any) {
    return Number.isInteger(page) && page > 0 ? page : 1
}

export async function searchRequest(
    endpoint: string = 'list',
    body: CtSearchRequestBody,
) {
    return fetch(`/api/search/clinical-trials/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(response => response.json())
}

export function queryOrFiltersAreSet(body: CtSearchRequestBody) {
    const coLocatedIsSet = (value?: string) =>
        value !== undefined && value !== 'all-trials'

    return (
        body.q !== '' ||
        coLocatedIsSet(body.coLocatedLocation) ||
        coLocatedIsSet(body.coLocatedInstitution) ||
        (body.filters?.filters ?? []).some(filter => filter.values?.length > 0)
    )
}
