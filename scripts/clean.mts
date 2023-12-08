import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import chalk from 'chalk'
import {getMeilisearchIndexName} from './helpers/meilisearch.mjs'

dotenv.config({path: './.env.local'})

fs.removeSync('./data/dist')

console.log(chalk.blue(`Removed ./data/dist (if it existed)`));

fs.removeSync('./data/dump')

console.log(chalk.blue(`Removed ./data/dump (if it existed)`));

fs.removeSync('./data/download')

console.log(chalk.blue(`Removed ./data/download (if it existed)`));

// Don't try to remove the search index if MeiliSearch is not configured
if (typeof process.env['MEILISEARCH_HOST'] === 'undefined') {
    process.exit(0)
}

const client = new MeiliSearch({
    host: process.env['MEILISEARCH_HOST'],
    apiKey: process.env['MEILISEARCH_MASTER_API_KEY'],
})

removeSearchIndexes()

async function removeSearchIndexes() {
    await Promise.all([
        removeSearchIndex('grants'),
        removeSearchIndex('exports'),
    ])
}

async function removeSearchIndex(indexName: string) {
    const name = getMeilisearchIndexName(indexName)

    const index = client.index(name)

    const response = await index.delete()

    console.log(chalk.blue(`Triggered task '${response.taskUid}' [status: ${response.status}] to delete search index '${response.indexUid}' (if it exists)`))
}
