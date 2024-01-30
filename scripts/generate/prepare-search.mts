// TODO we also need to delete documents that are no longer in the data

import {Client} from '@elastic/elasticsearch'
import fs from 'fs-extra'
import _ from 'lodash'
import {title, info, error} from '../helpers/log.mjs'

export default async function () {
    // Don't try to add the search index if we don't have access to all the
    // necessary ElasticSearch details
    if (
        !process.env.ELASTIC_HOST ||
        !process.env.ELASTIC_USERNAME ||
        !process.env.ELASTIC_PASSWORD
    ) {
        return
    }

    const tlsOptions = process.env.ELASTIC_HOST.includes('://localhost') ? {
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        }
    } : {}

    const client = new Client({
        node: process.env.ELASTIC_HOST,
        auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        },
        ...tlsOptions,
    })

    title('Indexing data in ElasticSearch')

    const indexPrefix = process.env.SEARCH_INDEX_PREFIX ?
        `${process.env.SEARCH_INDEX_PREFIX}-` :
        ''

    const indexName = `${indexPrefix}grants`

    const indexExists = await client.indices.exists({index: indexName})

    if (indexExists) {
        info(`Index ${indexName} already exists, skipping creation`)
    } else {
        info(`Creating index ${indexName}...`)

        await client.indices.create({
            index: indexName,
            mappings: {
                properties: {
                    GrantID: {type: 'keyword'},
                    GrantTitleEng: {type: 'text'},
                    Abstract: {type: 'text'},
                    LaySummary: {type: 'text'},
                    GrantAmountConverted: {type: 'long'},
                    GrantStartYear: {type: 'integer'},
                    Disease: {type: 'keyword'},
                    Pathogen: {type: 'keyword'},
                    ResearchInstitutionCountry: {type: 'keyword'},
                    ResearchInstitutionRegion: {type: 'keyword'},
                    FunderCountry: {type: 'keyword'},
                    FunderRegion: {type: 'keyword'},
                }
            }
        }).catch(e => {
            error(`Error creating index ${indexName}: ${e}`)
        })

        info(`Created index ${indexName}`)
    }

    info(`Bulk indexing ${indexName} with upserts...`)

    const docs: any[] = fs.readJsonSync('./data/dist/grants.json').map(
        (grant: any) => _.pick(grant, [
            'GrantID',
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
            'GrantAmountConverted',
            'GrantStartYear',
            'Disease',
            'Pathogen',
            'ResearchInstitutionCountry',
            'ResearchInstitutionRegion',
            'FunderCountry',
            'FunderRegion',
        ])
    )

    const response = await client.helpers.bulk({
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
    }).catch(e => {
        error(`Error indexing grants: ${e}`)
    })

    info(`Bulk Indexed ${indexName} with upserts. Results:`)

    Object.entries({...response}).forEach(([key, value]) => {
        info(`${key}: ${value}`)
    })
}
