export function getMeilisearchIndexPrefix() {
    return process.env.MEILISEARCH_INDEX_PREFIX ?
        `${process.env.MEILISEARCH_INDEX_PREFIX}-` :
        ''
}

export function getMeilisearchIndexName(indexName: string) {
    return `${getMeilisearchIndexPrefix()}${indexName}`
}
