type MeilisearchFilter = string | string[]

export interface MeilisearchRequestBody {
    q?: string
    filter?: MeilisearchFilter | MeilisearchFilter[]
    attributesToHighlight?: string[]
    highlightPreTag?: string
    highlightPostTag?: string
    limit?: number
    attributesToCrop?: string[]
    cropLength?: number
}

export async function meilisearchRequest(index: string, body: MeilisearchRequestBody) {
    return fetch(`/api/search`, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(response => response.json())
}

export function highlightedResultsRequestBody(body: MeilisearchRequestBody = {}): MeilisearchRequestBody {
    return {
        ...body,
        // attributesToHighlight: ['GrantTitleEng', 'Abstract', 'LaySummary'],
        // highlightPreTag: '<span class="highlighted-search-result-token">',
        // highlightPostTag: '</span>',
    }
}

export function exportRequestBody(body: MeilisearchRequestBody = {}): MeilisearchRequestBody {
    return {
        ...body,
        // TODO determine limit based on number of generated grants in complete dataset?
        limit: 100_000,
    }
}

export function exportRequestBodyFilteredToMatchingGrants(grants: {GrantID: number}[]): MeilisearchRequestBody {
    return {
        ...exportRequestBody(),
        filter: `GrantID IN [${grants.map(grant => grant.GrantID).join(',')}]`
    }
}
