export interface SearchResult {
    GrantID: number,
    GrantTitleEng: string,
    Abstract: string,
    LaySummary: string,
    _formatted: {
        GrantTitleEng: string,
        Abstract: string,
        LaySummary: string,
    }
}

export type SearchResults = Array<SearchResult>

export interface SearchResponse {
    hits: SearchResults,
    query: string,
    estimatedTotalHits: number,
}
