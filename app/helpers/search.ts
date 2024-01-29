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
    GrantID?: string[]
    Disease?: string[]
    Pathogen?: string[]
    ResearchInstitutionCountry?: string[]
    ResearchInstitutionRegion?: string[]
    FunderCountry?: string[]
    FunderRegion?: string[]
}

export interface SearchRequestBody {
    q: string
    filters: SearchFilters
}

export async function searchRequest(body: SearchRequestBody) {
    return fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        response => response.json()
    )
}

export async function exportSearchRequest(body: SearchRequestBody) {
    return fetch('/api/export-search', {
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
