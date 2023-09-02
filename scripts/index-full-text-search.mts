import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import _ from 'lodash'
import chalk from 'chalk'
import {StringDictionary} from './types/dictionary'
import getMeilisearchIndexName from './utils/getMeilisearchIndexName.mjs'

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
    if (typeof process.env.MEILISEARCH_HOST === 'undefined') {
        return
    }

    const masterApiKey = process.env.MEILISEARCH_MASTER_API_KEY

    const client = new MeiliSearch({
        host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
        apiKey: masterApiKey,
    })

    // Create index for regular grant free text search

    const indexName = getMeilisearchIndexName('grants')

    const index = client.index(indexName)

    index.updateSettings({
        pagination: {maxTotalHits: 100_000},
        displayedAttributes,
        searchableAttributes,
        filterableAttributes,
    })

    const response = await index.addDocuments(documents)

    console.log(chalk.blue(`Triggered task '${response.taskUid}' [status: ${response.status}] to add ${documents.length} documents to search index '${response.indexUid}'`))

    // Create index with complete dataset for exporting to CSV

    const exportIndexName = getMeilisearchIndexName('exports')

    const exportIndex = client.index(exportIndexName)

    exportIndex.updateSettings({
        pagination: {maxTotalHits: 100_000},
        displayedAttributes: ['*'],
        searchableAttributes,
        filterableAttributes: filterableAttributes.concat(['GrantID']),
        sortableAttributes: ['GrantID'],
    })

    const exportResponse = await exportIndex.addDocuments(data)

    console.log(chalk.blue(`Triggered task '${exportResponse.taskUid}' [status: ${exportResponse.status}] to add ${data.length} documents to search index '${exportResponse.indexUid}'`))

    // Get the Default Search API Key from Meilisearch if a Master Key is configured

    let searchApiKey = ''

    if (masterApiKey) {
        const keys = await client.getKeys()

        const key = keys.results.find(key => key.name === 'Default Search API Key')

        if (key) {
            searchApiKey = key.key
        }
    }

    // Set the prefix env, falling back to the Git branch name from Vercel's System Environment Variables
    const prefix = process.env.MEILISEARCH_INDEX_PREFIX ?? process.env.VERCEL_GIT_COMMIT_REF

    // If `.env.local` doesn't exist, create it and add the NEXT_PUBLIC_MEILISEARCH_* environment variables to it
    if (!fs.existsSync('./.env.local')) {
        fs.writeFileSync(
            './.env.local',
            ''.concat(
                `NEXT_PUBLIC_MEILISEARCH_HOST=${process.env.MEILISEARCH_HOST}`,
                `\nNEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY=${searchApiKey}`,
                `\nNEXT_PUBLIC_MEILISEARCH_INDEX_PREFIX=${prefix}`,
            )
        )

        console.log(chalk.blue(`Added NEXT_PUBLIC_MEILISEARCH_* environment variables to new .env.local`))

        return
    }

    // Remove existing NEXT_PUBLIC_MEILISEARCH_* environment variables from .env.local

    const env = fs.readFileSync('./.env.local', 'utf8')

    let nextPublicEnv = env.split('\n')
        .filter(
            line => !line.startsWith('NEXT_PUBLIC_MEILISEARCH_')
        )
        .join('\n')

    // Add NEXT_PUBLIC_MEILISEARCH_* environment variables to .env.local

    nextPublicEnv = nextPublicEnv.concat(
        `\nNEXT_PUBLIC_MEILISEARCH_HOST=${process.env.MEILISEARCH_HOST}`,
        `\nNEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY=${searchApiKey}`,
        `\nNEXT_PUBLIC_MEILISEARCH_INDEX_PREFIX=${prefix}`,
    )

    fs.writeFileSync('./.env.local', nextPublicEnv)

    console.log(chalk.blue(`Added Or Updated NEXT_PUBLIC_MEILISEARCH_* environment variables in existing .env.local`))
}
