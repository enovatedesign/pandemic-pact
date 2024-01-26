// TODO we also need to delete documents that are no longer in the data

import {Client} from '@elastic/elasticsearch'
import fs from 'fs-extra'
import _ from 'lodash'
import {getMeilisearchIndexName} from '../helpers/meilisearch.mjs'
import {Grant} from '../types/generate'
import {title, info, error} from '../helpers/log.mjs'

export default async function () {
    // Don't try to add the search index if ElasticSearch is not configured
    if (typeof process.env.ELASTIC_PASSWORD === 'undefined') {
        return;
    }

    const client = new Client({
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD,
        },
        // Only configure TLS in dev
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        },
    })

    // Add documents to search indexes

    title('Indexing data in ElasticSearch')

    const data: Grant[] = fs.readJsonSync('./data/dist/grants.json')

    const filterableGrantData = data.map(
        (grant) => _.pick(grant, [
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

    await bulkIndex(
        client,
        getMeilisearchIndexName('grants'),
        filterableGrantData,
    )

    await bulkIndex(
        client,
        getMeilisearchIndexName('exports'),
        data,
    )
}

async function bulkIndex(client: Client, indexName: string, docs: any[]) {
    const grantsIndexExists = await client.indices.exists({
        index: indexName,
    })

    if (!grantsIndexExists) {
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

    info(`Bulk Indexed ${indexName} with upserts. Response: ${JSON.stringify(response)}`)
}
