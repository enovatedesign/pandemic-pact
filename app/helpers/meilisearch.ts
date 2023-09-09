type MeilisearchFilter = string | string[]

export interface MeilisearchRequestBody {
    q?: string
    filter?: MeilisearchFilter | MeilisearchFilter[]
    attributesToHighlight?: string[]
    highlightPreTag?: string
    highlightPostTag?: string
    limit?: number
}

export async function meilisearchRequest(index: string, body: MeilisearchRequestBody) {
    if (!process.env.NEXT_PUBLIC_MEILISEARCH_HOST) {
        console.warn('NEXT_PUBLIC_MEILISEARCH_HOST is not set, not attempting meilisearch request')

        return Promise.resolve({
            "hits": [],
            "offset": 0,
            "limit": 0,
            "estimatedTotalHits": 0,
            "processingTimeMs": 0,
            "query": ""
        })
    }

    let headers: {
        'Content-Type': string
        'Authorization'?: string
    } = {'Content-Type': 'application/json'}

    const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
    const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY

    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
    }

    const indexName = process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_PREFIX ?
        `${process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_PREFIX}-${index}` :
        index

    return fetch(`${host}/indexes/${indexName}/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    }).then(response => response.json())
}

export function highlightedResultsRequestBody(body: MeilisearchRequestBody = {}, attributesToHighlight: string[]): MeilisearchRequestBody {
    return Object.assign(
        {},
        body,
        {
            attributesToHighlight,
            highlightPreTag: '<span style="color: red; font-weight: bold; font-style: italic;">',
            highlightPostTag: '</span>',
        },
    )
}

export function exportRequestBody(body: MeilisearchRequestBody = {}): MeilisearchRequestBody {
    return Object.assign(
        {},
        body,
        // TODO determine limit based on number of generated grants in complete dataset?
        {limit: 100_000},
    )
}

export function exportRequestBodyFilteredToMatchingGrants(grants: {GrantID: number}[]): MeilisearchRequestBody {
    return Object.assign(
        {},
        exportRequestBody(),
        {filter: `GrantID IN [${grants.map(grant => grant.GrantID).join(',')}]`}
    )
}
