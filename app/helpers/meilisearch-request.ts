export default async function meilisearchRequest(index: string, body: any) {
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
