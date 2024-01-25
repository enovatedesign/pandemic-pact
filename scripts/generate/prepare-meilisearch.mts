import {Client} from '@elastic/elasticsearch'
import fs from 'fs-extra'
import _ from 'lodash'
import {getMeilisearchIndexName} from '../helpers/meilisearch.mjs'
import {Grant} from '../types/generate'
import {title, info} from '../helpers/log.mjs'

export default async function () {
    // Don't try to add the search index if ElasticSearch is not configured
    if (typeof process.env.ELASTIC_PASSWORD === 'undefined') {
        return;
    }

    const client = new Client({
        node: 'http://localhost:9200',
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD,
        },
        tls: {
            //ca: process.env.elasticsearch_certificate,
            rejectUnauthorized: false,
        },
        // The following options were copied from the 'Basic Configuration' docs
        // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/basic-config.html
        maxRetries: 5,
        requestTimeout: 60000,
        sniffOnStart: true
    })

    const meep = await client.ping()
    console.log(meep);
    return;

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

    const grantsBulkIndexResponse = await bulkIndex(
        client,
        'grants',
        filterableGrantData,
    )

    console.log('grantBulkIndexResponse', Object.keys(grantsBulkIndexResponse));

    // const exportsBulkIndexResponse = await bulkIndex(
    //     client,
    //     'exports',
    //     data,
    // )

    // console.log('exportsBulkIndexResponse', exportsBulkIndexResponse);
}

async function bulkIndex(client: Client, indexName: string, docs: any[]) {
    return client.helpers.bulk({
        datasource: docs,
        onDocument: doc => ([
            {
                update: {
                    _index: getMeilisearchIndexName(indexName),
                    _id: doc.GrantID
                }
            },
            {
                doc_as_upsert: true
            }
        ]),
        onDrop: (doc) => {
            console.log(doc)
        },
    })
}
