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

    const docs: any[] = fs.readJsonSync('./data/dist/grants.json').map(
        (grant: any) => _.pick(grant, Object.keys(mappingProperties))
    )

    const response = await client.helpers.bulk({
        concurrency: 1,
        datasource: docs,
        onDocument: doc => ([
            {
                update: {
                    _index: indexName,
                    _id: doc.GrantID
                }
            },
            {
                doc_as_upsert: true
            }
        ]),
        onDrop: (doc: any) => {
            error(`Error indexing grant: ${JSON.stringify(doc, null, 2)}`)
        }
    }).catch(e => {
        error(`Error indexing grants: ${e}`)
    })

    info(`Bulk Indexed ${indexName} with upserts. Results:`)

    Object.entries({...response}).forEach(([key, value]) => {
        info(`${key}: ${value}`)
    })
}
