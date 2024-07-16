import fs from 'fs-extra'
import _ from 'lodash'
import { title, info, error } from '../helpers/log'
import {
    getIndexName,
    getSearchClient,
    fetchAllGrantIDsInIndex,
} from '../../app/api/helpers/search'

export default async function () {
    const client = getSearchClient()

    if (!client) {
        info('OpenSearch not configured, skipping indexing')
        return
    }

    title('Indexing data in OpenSearch')

    const indexName = getIndexName()

    const { body: updatingExistingIndex } = await client.indices.exists({
        index: indexName,
    })

    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')

    const mappingProperties = {
        GrantID: { type: 'keyword' },
        GrantTitleEng: { type: 'text' },
        Abstract: { type: 'text' },
        LaySummary: { type: 'text' },
        GrantAmountConverted: { type: 'long' },

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

    const allGrants = fs.readJsonSync('./data/dist/grants.json')

    const chunkSize = 1000

    const chunkedGrants = _.chunk(allGrants, chunkSize)

    for (let i = 0; i < chunkedGrants.length; i++) {
        if (i > 0) {
            info(`Indexed ${i * chunkSize}/${allGrants.length} documents`)
        }

        const grants = chunkedGrants[i]

        const bulkOperations: any[] = grants
            .map((grant: any) => {
                return [
                    {
                        update: {
                            _index: indexName,
                            _id: grant.GrantID,
                        },
                    },
                    {
                        doc: _.pick(grant, Object.keys(mappingProperties)),
                        doc_as_upsert: true,
                    },
                ]
            })
            .flat()

        await client
            .bulk({
                body: bulkOperations,
            })
            .catch(e => {
                error(e)
            })
    }

    info(`Bulk Indexed ${indexName} with upserts`)

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
                if (i > 0) {
                    info(
                        `Deleted ${i * chunkSize}/${
                            grantIDsToDelete.length
                        } documents`,
                    )
                }

                const grantIDs = chunkedGrantIDsToDelete[i]

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

                const response = await client
                    .bulk({
                        body: bulkOperations,
                    })
                    .catch(e => {
                        error(e)
                    })
            }

            info(
                `Removed ${grantIDsToDelete.length} documents that are no longer in the data`,
            )
        }
    }

    if (process.env.CI && process.env.SEARCH_INDEX_PREFIX) {
        const searchIndexPrefix = process.env.SEARCH_INDEX_PREFIX

        fs.appendFileSync('.env', `\nSEARCH_INDEX_PREFIX=${searchIndexPrefix}`)

        info(`Wrote SEARCH_INDEX_PREFIX ${searchIndexPrefix} to .env`)
    }
}
