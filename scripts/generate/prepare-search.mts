// TODO we also need to delete documents that are no longer in the data

import {Client} from '@opensearch-project/opensearch'
import fs from 'fs-extra'
import _ from 'lodash'
import {title, info, error} from '../helpers/log.mjs'

export default async function () {
    // Don't try to populate OpenSearch index if we don't have access to all the
    // necessary details
    if (
        !process.env.SEARCH_HOST ||
        !process.env.SEARCH_USERNAME ||
        !process.env.SEARCH_PASSWORD
    ) {
        return
    }

    const client = new Client({
        node: process.env.SEARCH_HOST,
        auth: {
            username: process.env.SEARCH_USERNAME,
            password: process.env.SEARCH_PASSWORD,
        },
    })

    title('Indexing data in OpenSearch')

    const indexPrefix = process.env.SEARCH_INDEX_PREFIX ?
        `${process.env.SEARCH_INDEX_PREFIX}-` :
        ''

    const indexName = `${indexPrefix}grants`

    const {body: indexExists} = await client.indices.exists({index: indexName})

    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')

    const mappingProperties = {
        GrantID: {type: 'keyword'},
        GrantTitleEng: {type: 'text'},
        Abstract: {type: 'text'},
        LaySummary: {type: 'text'},
        GrantAmountConverted: {type: 'long'},

        ...Object.fromEntries(
            Object.keys(selectOptions).map(
                field => [field, {type: 'keyword'}]
            )
        )
    }

    if (indexExists) {
        info(`Index ${indexName} already exists, skipping creation`)
    } else {
        info(`Creating index ${indexName}...`)

        await client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: mappingProperties,
                }
            }
        }).catch(e => {
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
            console.log(`Indexed ${i * chunkSize}/${allGrants.length} documents`)
        }

        const grants = chunkedGrants[i]

        const bulkOperations: any[] = grants.map(
            (grant: any) => ([
                {
                    update: {
                        _index: indexName,
                        _id: grant.GrantID,
                    }
                },
                {
                    doc: _.pick(grant, Object.keys(mappingProperties)),
                    doc_as_upsert: true,
                }
            ])
        ).flat()

        const response = await client.bulk({
            body: bulkOperations,
        }).catch(e => {
            error(e)
        })
    }

    info(`Bulk Indexed ${indexName} with upserts`)

    if (process.env.CI) {
        fs.appendFileSync(
            '.env',
            `\nSEARCH_INDEX_PREFIX=${indexPrefix}`
        )

        console.log(`Wrote SEARCH_INDEX_PREFIX ${indexPrefix} to .env`);
    }
}
