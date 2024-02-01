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
    },
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
}

export interface SearchFilters {
    logicalAnd: boolean,
    filters: {
        field: string,
        values: string[],
        logicalAnd: boolean,
    }[]
}

export interface SearchRequestBody {
    q: string
    filters: SearchFilters
}

export async function searchRequest(endpoint: string = 'list', body: SearchRequestBody) {
    return fetch(`/api/search/grants/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        response => response.json()
    )
}

export function queryOrFiltersAreSet(searchRequestBody: SearchRequestBody) {
    return searchRequestBody.q !== '' || Object.values(searchRequestBody.filters).some(
        filter => filter?.length > 0
    )
}
