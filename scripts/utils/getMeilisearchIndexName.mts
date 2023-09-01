export default function (indexName: string) {
    const prefix = process.env.MEILISEARCH_INDEX_PREFIX ?
        `${process.env.MEILISEARCH_INDEX_PREFIX}-` :
        ''

    return `${prefix}${indexName}`
}
