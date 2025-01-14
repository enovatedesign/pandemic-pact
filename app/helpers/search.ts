export interface SearchParameterSchema {
    [key: string]: {
        defaultValue: any
        queryStringParameter?: string
        excludeFromQueryString?: boolean
    }
}

export interface SelectedStandardSearchFilters {
    Disease?: string[]
    Pathogen?: string[]
    ResearchInstitutionCountry?: string[]
    ResearchInstitutionRegion?: string[]
    FunderCountry?: string[]
    FunderRegion?: string[]
}

export interface SearchParameters {
    q: string
    standardFilters: SelectedStandardSearchFilters
    jointFunding: string
    advancedFilters: SearchFilters
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

const searchParameterSchema: SearchParameterSchema = {
    q: {
        defaultValue: '',
    },
    standardFilters: {
        defaultValue: {},
        queryStringParameter: 'filters',
    },
    jointFunding: {
        defaultValue: 'all-grants',
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

export function prepareInitialSearchParameters(searchParams: URLSearchParams) {
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

    return Object.fromEntries(initialSearchParameters)
}

export function updateUrlQueryString(
    url: URL,
    searchParameters: SearchParameters,
) {
    Object.entries(searchParameterSchema).forEach(([key, schema]) => {
        if (schema.excludeFromQueryString) {
            return
        }

        const stateValue = searchParameters[key as keyof SearchParameters]

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
