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
 * Co-located filter values. The CT analogue of the grants joint-funding filter:
 * a "co-located" trial is one conducted across more than one country. Co-location
 * is determined independently for research location and research institution
 * (Technical Spec §6.1), each backed by its own precomputed flag (see
 * scripts/generate/prepare-trials-search.ts). This array is the canonical value
 * set used for request validation; the UI labels come from
 * coLocatedFilterOptionsFor() so each dropdown names its geography.
 */
export const coLocatedFilterOptions = [
    { label: 'All Clinical Trials (including co-located)', value: 'all-trials' },
    { label: 'Only Co-located Clinical Trials', value: 'only-co-located-trials' },
    { label: 'Exclude Co-located Clinical Trials', value: 'exclude-co-located-trials' },
]

/**
 * Field-specific co-located options for the Explore dropdowns. The values match
 * coLocatedFilterOptions; only the labels vary. Every label names its geography,
 * including the default: the two dropdowns sit side by side and Select only shows
 * the selected option's label, so a bare "All Clinical Trials" makes them
 * indistinguishable.
 */
export function coLocatedFilterOptionsFor(geography: string) {
    return [
        { label: `All Clinical Trials (${geography})`, value: 'all-trials' },
        { label: `Only Co-located by ${geography}`, value: 'only-co-located-trials' },
        { label: `Exclude Co-located by ${geography}`, value: 'exclude-co-located-trials' },
    ]
}

export interface CtSearchParameters {
    q: string
    standardFilters: CtStandardFilters
    // Co-location is tracked independently for research location and research
    // institution (Technical Spec §6.1 — treated independently, no fallback).
    coLocatedLocation: string
    coLocatedInstitution: string
    advancedFilters: CtSearchFilters
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

interface SearchParameterSchema {
    [key: string]: {
        defaultValue: any
        queryStringParameter?: string
        excludeFromQueryString?: boolean
    }
}

const searchParameterSchema: SearchParameterSchema = {
    q: {
        defaultValue: '',
    },
    standardFilters: {
        defaultValue: {},
        queryStringParameter: 'filters',
    },
    coLocatedLocation: {
        defaultValue: 'all-trials',
    },
    coLocatedInstitution: {
        defaultValue: 'all-trials',
    },
    advancedFilters: {
        defaultValue: {
            logicalAnd: true,
            filters: [],
        },
        excludeFromQueryString: true,
    },
    page: {
        defaultValue: 1,
    },
    limit: {
        defaultValue: 25,
    },
}

export function prepareInitialSearchParameters(
    searchParams: URLSearchParams,
): CtSearchParameters {
    const initialSearchParameters = Object.entries(searchParameterSchema).map(
        ([key, schema]) => {
            if (schema.excludeFromQueryString) {
                return [key, schema.defaultValue]
            }

            const searchParamValue = searchParams.get(
                schema.queryStringParameter ?? key,
            )

            if (!searchParamValue) {
                return [key, schema.defaultValue]
            }

            if (typeof schema.defaultValue === 'number') {
                return [key, parseInt(searchParamValue)]
            }

            if (typeof schema.defaultValue === 'object') {
                return [key, JSON.parse(searchParamValue)]
            }

            return [key, searchParamValue]
        },
    )

    return Object.fromEntries(initialSearchParameters) as CtSearchParameters
}

export function updateUrlQueryString(
    url: URL,
    searchParameters: CtSearchParameters,
) {
    Object.entries(searchParameterSchema).forEach(([key, schema]) => {
        if (schema.excludeFromQueryString) {
            return
        }

        const stateValue = searchParameters[key as keyof CtSearchParameters]

        if (schema.defaultValue === stateValue) {
            url.searchParams.delete(key)
            return
        }

        const value =
            typeof stateValue === 'object'
                ? JSON.stringify(stateValue)
                : `${stateValue}`

        url.searchParams.set(schema.queryStringParameter ?? key, value)
    })
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
