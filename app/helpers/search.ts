export interface SearchResult {
    _index: string,
    _id: string,
    _score: number,
    _source: {
        GrantID: string,
        GrantTitleEng: string,
        Abstract: string,
        LaySummary: string,
        GrantAmountConverted: number,
        GrantStartYear: string,
    },
    highlight: {
        GrantTitleEng: string[],
        Abstract: string[],
        LaySummary: string[],
    }
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
    highlight: boolean,
}

export async function searchRequest(body: SearchRequestBody) {
    return fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        response => response.json()
    )
}
