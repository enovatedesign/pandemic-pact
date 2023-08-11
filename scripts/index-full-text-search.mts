import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import _ from 'lodash'
import chalk from 'chalk'
import {StringDictionary} from './types/dictionary'

dotenv.config({path: './.env.local'})

const data: Array<StringDictionary> = fs.readJsonSync('./data/dist/complete-dataset.json')

const documents = data.map(
    record => _.pick(record, ['GrantID', 'GrantTitleEng', 'Abstract', 'LaySummary'])
)

fs.ensureDirSync('./data/dump')

fs.writeJsonSync('./data/dump/free-text-dataset.json', documents, {spaces: 2})

console.log(chalk.blue(`Dumped ${documents.length} free text search documents to ./data/dump/free-text-dataset.json`))

addDocumentsToSearchIndex()

async function addDocumentsToSearchIndex() {
    // Don't try to remove the search index if MeiliSearch is not configured
    if (typeof process.env['MEILISEARCH_HOST'] === 'undefined') {
        return;
    }

    const client = new MeiliSearch({
        host: process.env['MEILISEARCH_HOST'] || 'http://localhost:7700',
        apiKey: process.env['MEILISEARCH_API_KEY'],
    })

    const indexName = 'grants'

    const index = client.index(indexName)

    index.updateSettings({
        pagination: {maxTotalHits: 100000},
        displayedAttributes: ['GrantID'],
        searchableAttributes: ['GrantTitleEng', 'Abstract', 'LaySummary'],
    })

    const response = await index.addDocuments(documents)

    console.log(chalk.blue(`Triggered task '${response.taskUid}' [status: ${response.status}] to add ${documents.length} documents to search index '${response.indexUid}'`))
}
