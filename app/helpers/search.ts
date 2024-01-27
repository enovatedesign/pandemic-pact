export interface SearchResult {
    GrantID: number,
    GrantTitleEng: string,
    Abstract: string,
    LaySummary: string,
    GrantAmountConverted?: number,
    GrantStartYear: string,
    _formatted: {
        GrantTitleEng: string,
        Abstract: string,
        LaySummary: string,
    }
    _rankingScore?: number,
}

export type SearchResults = Array<SearchResult>

export interface SearchResponse {
    hits: SearchResults,
    query: string,
    estimatedTotalHits: number,
}

export interface SearchFilters {
    Disease: string[];
    Pathogen: string[];
    ResearchInstitutionCountry: string[];
    ResearchInstitutionRegion: string[];
    FunderCountry: string[];
    FunderRegion: string[];
}

export interface SearchRequestBody {
    q: string,
    filters: SearchFilters,
}

export async function searchRequest(body: SearchRequestBody) {
    console.log('searchRequest', body);
    return fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        response => response.json()
    )
}
