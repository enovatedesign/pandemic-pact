export interface SearchResult {
    GrantID: number,
    GrantTitleEng: string,
    _formatted: {
        GrantTitleEng: string,
    }
}

export type SearchResults = Array<SearchResult>

export interface SearchResponse {
    hits: SearchResults,
    query: string,
    estimatedTotalHits: number,
}
