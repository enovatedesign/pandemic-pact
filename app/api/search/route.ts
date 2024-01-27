import {Client} from '@elastic/elasticsearch'
import fs from 'fs'

export async function POST(request: Request) {
    if (typeof process.env.ELASTIC_PASSWORD === 'undefined') {
        return Response.json({
            error: 'Service Unavailable',
        }, {
            status: 503,
            statusText: 'Service Unavailable',
        })
    }

    const client = new Client({
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD,
        },
        // TODO only config tls in dev
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        },
    })

    // TODO properly validate and parse input
    const parameters = await request.json()

    const {q, filters, highlight} = parameters

    let mustClause = {}

    if (q) {
        mustClause = {
            must: {
                simple_query_string: {
                    query: q,
                    fields: [
                        'GrantTitleEng^4',
                        'Abstract^2',
                        'LaySummary'
                    ],
                    default_operator: 'and'
                }
            }
        }
    }

    let filterClause = {}

    if (filters) {
        filterClause = {
            filter: Object.entries(filters).filter(
                ([key, value]) => value.length > 0
            ).map(
                ([key, value]) => ({
                    'terms': {[key]: value}
                })
            )
        }
    }

    let highlightClause = {}

    if (highlight) {
        const highlightSettings = {
            pre_tags: ['<span class="highlighted-search-result-token">'],
            post_tags: ['</span>']
        }

        highlightClause = {
            highlight: {
                fields: {
                    GrantTitleEng: highlightSettings,
                    Abstract: highlightSettings,
                    LaySummary: highlightSettings,
                }
            }
        }
    }

    // TODO refactor this into a shared module used by both
    // this and the generate script, if possible?
    const indexPrefix = process.env.SEARCH_INDEX_PREFIX ?
        `${process.env.SEARCH_INDEX_PREFIX}-` :
        ''

    console.log(filterClause);

    const result = await client.search({
        index: `${indexPrefix}grants`,
        _source: [
            'GrantID',
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
            'GrantAmountConverted',
            'GrantStartYear',
        ],
        size: 20,
        body: {
            query: {
                bool: {
                    ...mustClause,
                    ...filterClause,
                }
            },
            ...highlightClause,
        }
    })

    return Response.json(result.hits)
}
