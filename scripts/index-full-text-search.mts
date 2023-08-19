import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import _ from 'lodash'
import chalk from 'chalk'
import {StringDictionary} from './types/dictionary'

dotenv.config({path: './.env.local'})

const data: Array<StringDictionary> = fs.readJsonSync('./data/dist/complete-dataset.json')

const attributes = [
    'GrantID',
    'GrantTitleEng',
    'Abstract',
    'LaySummary',
    'Disease',
    'Pathogen'
]

const displayedAttributes = [
    'GrantID',
    'GrantTitleEng',
]

const searchableAttributes = [
    'GrantTitleEng',
    'Abstract',
    'LaySummary',
]

const filterableAttributes = [
    'Disease',
    'Pathogen',
]

const documents = data.map(record => _.pick(record, attributes))

fs.ensureDirSync('./data/dump')

fs.writeJsonSync('./data/dump/free-text-dataset.json', documents, {spaces: 2})

console.log(chalk.blue(`Dumped ${documents.length} free text search documents to ./data/dump/free-text-dataset.json`))

addDocumentsToSearchIndex()

async function addDocumentsToSearchIndex() {
    // Don't try to add the search index if MeiliSearch is not configured
    if (typeof process.env['MEILISEARCH_HOST'] === 'undefined') {
        return;
    }

    const client = new MeiliSearch({
        host: process.env['MEILISEARCH_HOST'] || 'http://localhost:7700',
        apiKey: process.env['MEILISEARCH_MASTER_API_KEY'],
    })

    // Create index for regular grant free text search

    const indexName = 'grants'

    const index = client.index(indexName)

    index.updateSettings({
        pagination: {maxTotalHits: 100_000},
        displayedAttributes,
        searchableAttributes,
        filterableAttributes,
    })

    const response = await index.addDocuments(documents)

    console.log(chalk.blue(`Triggered task '${response.taskUid}' [status: ${response.status}] to add ${documents.length} documents to search index '${response.indexUid}'`))

    // Create index with complete dataset for exporting to CSV/XLSX

    const exportIndexName = 'exports'

    const exportIndex = client.index(exportIndexName)

    exportIndex.updateSettings({
        pagination: {maxTotalHits: 100_000},
        displayedAttributes: ['*'],
        searchableAttributes: [],
        filterableAttributes,
        sortableAttributes: ['GrantID'],
        rankingRules: [
            "sort",
            "words",
            "typo",
            "proximity",
            "attribute",
            "exactness"
        ],
    })

    const exportResponse = await exportIndex.addDocuments(data)

    console.log(chalk.blue(`Triggered task '${exportResponse.taskUid}' [status: ${exportResponse.status}] to add ${data.length} documents to search index '${exportResponse.indexUid}'`))
}
