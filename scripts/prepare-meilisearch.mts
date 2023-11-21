import dotenv from 'dotenv'
import {MeiliSearch} from 'meilisearch'
import fs from 'fs-extra'
import _ from 'lodash'
import chalk from 'chalk'
import {StringDictionary} from './types/dictionary'
import {getMeilisearchIndexName} from './helpers/meilisearch.mjs'

dotenv.config({path: './.env.local'})

const host = process.env.MEILISEARCH_HOST
const masterApiKey = process.env.MEILISEARCH_MASTER_API_KEY

main()

async function main() {
    // Don't try to add the search index if MeiliSearch is not configured
    if (!host) {
        return
    }
    const client = new MeiliSearch({
        host,
        apiKey: masterApiKey,
    })

    // Add documents to search indexes

    const data: Array<StringDictionary> = fs.readJsonSync('./data/dist/complete-dataset.json')

    await addDocumentsToSearchIndex(client, data, 'grants')

    await addDocumentsToSearchIndex(client, data, 'exports', {
        pagination: {maxTotalHits: 100_000},
        displayedAttributes: ['*'],
    })

    // Write NEXT_PUBLIC_MEILISEARCH_* environment variables to .env.local if they don't exist or need to be updated

    await updateEnvFile(client)
}

async function addDocumentsToSearchIndex(client: MeiliSearch, data: Array<StringDictionary>, indexName: string, settings?: any) {
    const defaultSettings = {
        displayedAttributes: [
            'GrantID',
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
            'GrantAmountConverted',
            'GrantStartYear',
        ],

        searchableAttributes: [
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
        ],

        filterableAttributes: [
            'GrantID',
            'Disease',
            'Pathogen',
            'ResearchInstitutionCountry',
            'ResearchInstitutionRegion',
            'FunderCountry',
            'FunderRegion',
        ],
    }

    const distinctAttributes = _.uniq(Object.values(defaultSettings).flat());

    const mergedSettings = {...defaultSettings, ...settings}

    const documents = mergedSettings.displayedAttributes.includes('*')
        ? data
        : data.map(record => _.pick(record, distinctAttributes))

    const prefixedIndexName = getMeilisearchIndexName(indexName)

    const index = client.index(prefixedIndexName)

    index.updateSettings(mergedSettings)

    const response = await index.addDocuments(documents, {primaryKey: 'GrantID'})

    console.log(chalk.blue(`Triggered task '${response.taskUid}'[status: ${response.status}]to add ${documents.length} documents to search index '${response.indexUid}'`))

    // Dump the settings and documents for debugging/reference purposes

    const dumpDir = './data/dump'
    const settingsDumpFilename = `${indexName}-index-settings.json`
    const docDumpFilename = `${indexName}-index-documents.json`

    fs.ensureDirSync(dumpDir)

    fs.writeJsonSync(`${dumpDir}/${docDumpFilename}`, documents, {spaces: 2})
    fs.writeJsonSync(`${dumpDir}/${settingsDumpFilename}`, mergedSettings, {spaces: 2})

    console.log(chalk.blue(`Dumped index settings to ${dumpDir}/${settingsDumpFilename} and documents to ${dumpDir}/${docDumpFilename}`))
}

async function updateEnvFile(client: MeiliSearch) {
    // Get the Default Search API Key from Meilisearch if a Master Key is configured

    let searchApiKey = ''

    if (masterApiKey) {
        const keys = await client.getKeys()

        const key = keys.results.find(key => key.name === 'Default Search API Key')

        if (key) {
            searchApiKey = key.key
        }
    }

    // If `.env.local` doesn't exist, create it and add the NEXT_PUBLIC_MEILISEARCH_* environment variables to it
    if (!fs.existsSync('./.env.local')) {
        fs.writeFileSync('./.env.local', environmentVariablesToWrite(searchApiKey))

        console.log(chalk.blue(`Added NEXT_PUBLIC_MEILISEARCH_ * environment variables to new.env.local`))

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

    nextPublicEnv = nextPublicEnv.concat(`\n${environmentVariablesToWrite(searchApiKey)}`)

    fs.writeFileSync('./.env.local', nextPublicEnv)

    console.log(chalk.blue(`Added Or Updated NEXT_PUBLIC_MEILISEARCH_ * environment variables in existing.env.local`))
}

function environmentVariablesToWrite(searchApiKey: string) {
    const variablesToWrite = [
        `NEXT_PUBLIC_MEILISEARCH_HOST = ${host}`,
        `NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY = ${searchApiKey}`,
    ]

    if (process.env.MEILISEARCH_INDEX_PREFIX) {
        variablesToWrite.push(`NEXT_PUBLIC_MEILISEARCH_INDEX_PREFIX = ${process.env.MEILISEARCH_INDEX_PREFIX}`)
    }

    return variablesToWrite.join('\n')
}
