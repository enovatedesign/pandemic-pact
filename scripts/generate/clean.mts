import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import {getMeilisearchIndexName} from '../helpers/meilisearch.mjs'
import {title, info} from '../helpers/log.mjs'

export default async function () {
    title('Removing files and search indices from previous run')

    dotenv.config({path: './.env.local'})

    fs.removeSync('./data/dist')

    info('Removed ./data/dist (if it existed)')

    fs.removeSync('./data/dump')

    info('Removed ./data/dump (if it existed)')

    fs.removeSync('./data/download')

    info('Removed ./data/download (if it existed)')

    // Don't try to remove the search index if MeiliSearch is not configured
    if (typeof process.env['MEILISEARCH_HOST'] === 'undefined') {
        process.exit(0)
    }

    const client = new MeiliSearch({
        host: process.env['MEILISEARCH_HOST'],
        apiKey: process.env['MEILISEARCH_MASTER_API_KEY'],
    })

    await Promise.all([
        removeSearchIndex(client, 'grants'),
        removeSearchIndex(client, 'exports'),
    ])
}

async function removeSearchIndex(client: MeiliSearch, indexName: string) {
    const name = getMeilisearchIndexName(indexName)

    const index = client.index(name)

    const response = await index.delete()

    info(`Triggered task '${response.taskUid}' [status: ${response.status}] to delete search index '${response.indexUid}' (if it exists)`)
}
