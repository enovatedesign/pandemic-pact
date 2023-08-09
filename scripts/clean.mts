import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import chalk from 'chalk'

dotenv.config({path: './.env.local'})

fs.removeSync('./data/dist')

console.log(chalk.blue(`Removed ./data/dist (if it existed)`));

fs.removeSync('./data/dump')

console.log(chalk.blue(`Removed ./data/dump (if it existed)`));

removeSearchIndex()

async function removeSearchIndex() {
    const client = new MeiliSearch({
        host: process.env['MEILISEARCH_HOST'] || 'http://localhost:7700',
        apiKey: process.env['MEILISEARCH_API_KEY'],
    })

    const indexName = 'grants'

    const index = client.index(indexName)

    const response = await index.delete()

    console.log(chalk.blue(`Triggered task '${response.taskUid}' [status: ${response.status}] to delete search index '${response.indexUid}' (if it exists)`))
}
