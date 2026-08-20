import { isPlainObject } from 'lodash'

/** Standard (simple) filters: a map of grant field -> selected option codes. */
export type SelectedStandardSearchFilters = Record<string, string[]>

/**
 * The advanced search's joint funding row. It sets the joint funding parameter
 * rather than adding a filter, so it has no option list of its own.
 */
export const JOINT_FUNDING_FIELD = 'JointFunding'

export interface AdvancedSearchRow {
    key: string
    field: string
    values: string[]
    logicalAnd: boolean
    /**
     * Optional strain cascade. The parent tracks which of the row's selected
     * diseases is being narrowed and is UI-only — that disease is already in the
     * row's own values — so only the child ever becomes a filter.
     */
    subCategoryParent: { field: string | null; value: string | null }
    subCategoryChild: { field: string | null; value: string | null }
}

export interface AdvancedSearchState {
    rows: AdvancedSearchRow[]
    logicalAnd: boolean
    /** Monotonic source of row keys, so they stay unique across a stored state. */
    nextRowKey: number
}

export interface SearchParameters {
    q: string
    standardFilters: SelectedStandardSearchFilters
    jointFunding: string
    /**
     * The advanced search is held as its row model rather than the derived API
     * filters: the filters are lossy (empty rows, the chosen field before its
     * values, the global and/or) and can't rebuild the UI on restore.
     */
    advancedSearch: AdvancedSearchState
    showAdvancedSearch: boolean
    page: number
    limit: number
}

export interface SearchResult {
    _index: string
    _id: string
    _score: number
    _source: {
        GrantID: string
        GrantTitleEng: string
        Abstract: string
        LaySummary: string
        GrantAmountConverted: number
        GrantStartYear: string
        FundingOrgName: string[]
        PublicationCount: number
    }
    highlight: {
        GrantTitleEng: string[]
        Abstract: string[]
        LaySummary: string[]
    }
}

export type SearchResults = Array<SearchResult>

export interface SearchResponse {
    hits: SearchResults
    query: string
    total: {
        value: number
    }
}

export interface Filter {
    field: string
    values: string[]
    logicalAnd: boolean
}

export interface SearchFilters {
    logicalAnd: boolean
    filters: Filter[]
}

export interface SearchRequestBody {
    q: string
    filters: SearchFilters
    jointFunding: string
}

const DEFAULT_ADVANCED_SEARCH_FIELDS = ['StudySubject', 'Ethnicity']

export function emptyAdvancedSearchRow(field: string, key: number): AdvancedSearchRow {
    return {
        key: `row-${key}`,
        field,
        values: [],
        logicalAnd: false,
        subCategoryParent: { field: null, value: null },
        subCategoryChild: { field: null, value: null },
    }
}

export function defaultAdvancedSearchState(): AdvancedSearchState {
    return {
        rows: DEFAULT_ADVANCED_SEARCH_FIELDS.map(emptyAdvancedSearchRow),
        logicalAnd: true,
        nextRowKey: DEFAULT_ADVANCED_SEARCH_FIELDS.length,
    }
}

/** Derive the filter payload the API expects from the advanced search rows. */
export function buildAdvancedSearchFilters(
    state: AdvancedSearchState,
): SearchFilters {
    const rowFilters: Filter[] = state.rows
        .filter(
            row =>
                row.field &&
                row.field !== JOINT_FUNDING_FIELD &&
                row.values.length > 0,
        )
        .map(({ field, values, logicalAnd }) => ({ field, values, logicalAnd }))

    const strainFilters: Filter[] = state.rows
        .filter(row => row.subCategoryChild.field && row.subCategoryChild.value)
        .map(row => ({
            field: row.subCategoryChild.field as string,
            values: [row.subCategoryChild.value as string],
            logicalAnd: true,
        }))

    return {
        logicalAnd: state.logicalAnd,
        filters: [...rowFilters, ...strainFilters],
    }
}

/**
 * The joint funding row sets a request parameter rather than adding a filter, so
 * its value is read back off the row. Change that row's field or remove it and
 * the constraint goes with it, the same as any other row.
 */
export function advancedJointFunding(state: AdvancedSearchState): string {
    const jointFundingRow = state.rows.find(
        ({ field, values }) =>
            field === JOINT_FUNDING_FIELD && values.length > 0,
    )

    return jointFundingRow?.values[0] ?? jointFundingFilterOptions[0].value
}

export function defaultSearchParameters(): SearchParameters {
    return {
        q: '',
        standardFilters: {},
        jointFunding: 'all-grants',
        advancedSearch: defaultAdvancedSearchState(),
        showAdvancedSearch: false,
        page: 1,
        limit: 25,
    }
}

/** Query string parameters that seed the page and are then stripped from the URL. */
export const DEEP_LINK_PARAMETERS = ['q', 'filters', 'jointFunding']

/**
 * State arriving from outside the page — the map's `?filters=` links and the
 * grant page's `?q=` back link. A deep link replaces any stored state rather
 * than merging with it, so the link lands on exactly what it describes.
 */
export function searchParametersFromDeepLink(
    searchParams: URLSearchParams,
): SearchParameters | null {
    const query = searchParams.get('q')
    const filters = searchParams.get('filters')
    const jointFunding = searchParams.get('jointFunding')

    if (!query && !filters && !jointFunding) {
        return null
    }

    const parameters = defaultSearchParameters()

    if (query) {
        parameters.q = query
    }

    if (jointFundingFilterOptions.some(({ value }) => value === jointFunding)) {
        parameters.jointFunding = jointFunding as string
    }

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
 * pruneGrantsSearchParameters.
 */
export function restoreSearchParameters(
    restored: any,
    isReturnVisit: boolean = false,
): SearchParameters {
    const defaults = defaultSearchParameters()

    if (!isPlainObject(restored)) {
        return defaults
    }

    return {
        ...defaults,
        ...restored,
        standardFilters: isPlainObject(restored.standardFilters)
            ? restored.standardFilters
            : defaults.standardFilters,
        advancedSearch: Array.isArray(restored.advancedSearch?.rows)
            ? { ...defaults.advancedSearch, ...restored.advancedSearch }
            : defaults.advancedSearch,
        jointFunding: jointFundingFilterOptions.some(
            ({ value }) => value === restored.jointFunding,
        )
            ? restored.jointFunding
            : defaults.jointFunding,
        // A fresh visit opens on the first page however deep the stored state,
        // but a back or forward is a return to results already being read.
        page: isReturnVisit ? restoredPage(restored.page) : 1,
    }
}

function restoredPage(page: any) {
    return Number.isInteger(page) && page > 0 ? page : 1
}

export async function highlightMatchesInGrant(grant: any, query: string) {
    if (!query) {
        return {
            GrantTitleEng: grant.GrantTitleEng,
            Abstract: grant.Abstract,
            LaySummary: grant.LaySummary,
        }
    }

    const response = await searchRequest('show', {
        q: query,
        filters: {
            logicalAnd: false,
            filters: [
                {
                    field: 'GrantID',
                    values: [grant.GrantID],
                    logicalAnd: false,
                },
            ],
        },
        jointFunding: 'all-grants',
    })

    const hit = response.hits[0]

    if (!hit) {
        return {
            GrantTitleEng: grant.GrantTitleEng,
            Abstract: grant.Abstract,
            LaySummary: grant.LaySummary,
        }
    }

    return {
        GrantTitleEng: hit.highlight?.GrantTitleEng[0] || grant.GrantTitleEng,
        Abstract: hit.highlight?.Abstract?.[0] || grant.Abstract,
        LaySummary: hit.highlight?.LaySummary?.[0] || grant.LaySummary,
    }
}

export async function searchRequest(
    endpoint: string = 'list',
    body: SearchRequestBody,
) {
    return fetch(`/api/search/grants/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(response => response.json())
}

export function queryOrFiltersAreSet(searchRequestBody: SearchRequestBody) {
    return (
        searchRequestBody.q !== '' ||
        Object.values(searchRequestBody.filters).some(
            filter => filter?.length > 0,
        ) ||
        searchRequestBody.jointFunding !== 'all-grants'
    )
}

export const jointFundingFilterOptions = [
    {
        label: 'All Grants (including joint-funded grants)',
        value: 'all-grants',
    },
    {
        label: 'Only Joint-funded Grants',
        value: 'only-joint-funded-grants',
    },
    {
        label: 'Exclude Joint-funded Grants',
        value: 'exclude-joint-funded-grants',
    },
]
