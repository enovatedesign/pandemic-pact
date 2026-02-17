import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'
import { title, info, error, warn } from '../helpers/log'
import {
    getIndexName,
    getSearchClient,
    fetchAllGrantIDsInIndex,
} from '../../app/api/helpers/search'
import { execSync } from 'child_process'
import { Grant } from '../types/generate'

export default async function prepareSearch(publicationCounts?: Record<string, number>) {
    if (process.env.SKIP_OPENSEARCH_INDEXING) {
        warn('Skipping OpenSearch indexing because SKIP_OPENSEARCH_INDEXING env var is present')
        return
    }

    const client = getSearchClient()

    if (!client) {
        info('OpenSearch not configured, skipping indexing')
        return
    }

    title('Indexing data in OpenSearch')

    const indexName = getIndexName()

    // Check if the index already exists
    const { body: updatingExistingIndex } = await client.indices.exists({ index: indexName })

    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')

    // Define explicit types for each field in the index.
    // Keyword fields are typically used for filters, whereas
    // text fields are used for fuzzy text searches.
    const mappingProperties = {
        GrantID: { type: 'keyword' },
        GrantTitleEng: { type: 'text' },
        Abstract: { type: 'text' },
        LaySummary: { type: 'text' },
        GrantAmountConverted: { type: 'long' },
        JointFunding: { type: 'boolean' },
        PublicationCount: { type: 'long'},

        // Prepare a keyword type field for each select option
        ...Object.fromEntries(
            Object.keys(selectOptions).map(field => [
                field,
                { type: 'keyword' },
            ]),
        ),
    }

    if (updatingExistingIndex) {
        info(`Index ${indexName} already exists, skipping creation`)
    } else {
        info(`Creating index ${indexName}...`)

        // Create a new index with the defined mapping properties if
        // it doesn't already exist
        await client.indices
            .create({
                index: indexName,
                body: {
                    mappings: {
                        properties: mappingProperties,
                    },
                },
            })
            .catch(e => {
                error(`Error creating index ${indexName}: ${e}`)
            })

        info(`Created index ${indexName}`)
    }

    info(`Bulk indexing ${indexName} with upserts...`)

    const zippedGrantsPath = './data/dist/grants.json.gz'
    const gzipBuffer = fs.readFileSync(zippedGrantsPath)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const allGrants: Grant[] = JSON.parse(jsonBuffer.toString())

    const chunkSize = 500

    const chunkedGrants = _.chunk(allGrants, chunkSize)

    for (let i = 0; i < chunkedGrants.length; i++) {
        // Output progress every 500 documents
        if (i > 0) {
            info(`Indexed ${i * chunkSize}/${allGrants.length} documents`)
        }

        const grants = chunkedGrants[i]

        // Prepare the bulk upsert operations for this chunk of grants
        const bulkOperations: any[] = grants
            .map((grant: any) => {
                // Get an object with only the fields we want to index
                const doc = _.pick(grant, Object.keys(mappingProperties))

                // Prepare a bulk operation for each grant, indicating that
                // we want to update the document in the index if it already
                // exists, or create it if it doesn't (using doc_as_upsert)
                return [
                    // Specify the operation
                    {
                        update: {
                            _index: indexName,
                            _id: grant.GrantID,
                        },
                    },
                    // Specify the document to update or create
                    {
                        doc: {
                            ...doc,
                            // Add a flag to indicate if there is more than 
                            // one funder country for filtering purposes on the
                            // frontend
                            JointFunding: doc.FunderCountry.length > 1,
                            // Retrieve the number of publications the grant has
                            // This is to display in the search result 
                            PublicationCount: publicationCounts?.[grant.PubMedGrantId as string] ?? 0,
                        },
                        doc_as_upsert: true,
                    },
                ]
            })
            .flat()

        // Send the bulk upsert operations to OpenSearch
        await client
            .bulk({
                body: bulkOperations,
            })
            .catch(e => {
                error(e)
            })

        // Sleep for a second to avoid rate limiting
        execSync('sleep 1')
    }

    info(`Bulk Indexed ${indexName} with upserts`)

    // If the index already existed, check if there are any documents in the
    // index that are no longer in the source data, and remove them
    if (updatingExistingIndex) {
        const allGrantIDsInIndex = await fetchAllGrantIDsInIndex(client)

        const grantIDsInData = allGrants.map((grant: any) => grant.GrantID)

        const grantIDsToDelete = _.difference(
            allGrantIDsInIndex,
            grantIDsInData,
        )

        if (grantIDsToDelete.length > 0) {
            info(`Removing documents that are no longer in the data...`)

            const chunkedGrantIDsToDelete = _.chunk(grantIDsToDelete, chunkSize)

            for (let i = 0; i < chunkedGrantIDsToDelete.length; i++) {
                // Output progress every 500 documents
                if (i > 0) {
                    info(
                        `Deleted ${i * chunkSize}/${
                            grantIDsToDelete.length
                        } documents`,
                    )
                }

                const grantIDs = chunkedGrantIDsToDelete[i]

                // Prepare the bulk delete operations for this chunk of grants
                const bulkOperations: any[] = grantIDs.map(
                    (grantID: string) => {
                        return {
                            delete: {
                                _index: indexName,
                                _id: grantID,
                            },
                        }
                    },
                )

                // Send the bulk delete operations to OpenSearch
                const response = await client
                    .bulk({
                        body: bulkOperations,
                    })
                    .catch(e => {
                        error(e)
                    })

                // Sleep for a second to avoid rate limiting
                execSync('sleep 1')
            }

            info(
                `Removed ${grantIDsToDelete.length} documents that are no longer in the data`,
            )
        }
    }

    // Review deploys are triggered by Gitlab CI and are provided with a SEARCH_INDEX_PREFIX
    // that way, which means that they aren't stored at Vercel. Therefore we need to inject
    // the SEARCH_INDEX_PREFIX environment variable into the .env file so that the NextJS
    // API routes can access it.
    if (process.env.CI && process.env.SEARCH_INDEX_PREFIX) {
        const searchIndexPrefix = process.env.SEARCH_INDEX_PREFIX

        fs.appendFileSync('.env', `\nSEARCH_INDEX_PREFIX=${searchIndexPrefix}`)

        info(`Wrote SEARCH_INDEX_PREFIX ${searchIndexPrefix} to .env`)
    }
}
