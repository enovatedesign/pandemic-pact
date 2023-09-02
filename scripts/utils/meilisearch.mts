export function getMeilisearchIndexPrefix() {
    const prefix = process.env.MEILISEARCH_INDEX_PREFIX ?? process.env.VERCEL_GIT_COMMIT_REF
    return prefix ? `${prefix}-` : ''
}

export function getMeilisearchIndexName(indexName: string) {
    return `${getMeilisearchIndexPrefix()}${indexName}`
}
