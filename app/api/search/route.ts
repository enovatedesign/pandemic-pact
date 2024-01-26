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

    const {q, filter, highlight} = parameters

    let mustClause = {}

    if (q) {
        mustClause = {
            must: {
                simple_query_string: {
                    query: q,
                    fields: [
                        "GrantTitleEng^4",
                        "Abstract^2",
                        "LaySummary"
                    ],
                    default_operator: "and"
                }
            }
        }
    }

    let filterClause = {}

    if (filter) {
        filterClause = {
            filter: Object.entries(filter).map(
                ([key, value]) => ({
                    "terms": {[key]: value}
                })
            )
        }
    }

    let highlightClause = {}

    if (highlight) {
        highlightClause = {
            highlight: {
                fields: {
                    GrantTitleEng: {},
                    Abstract: {},
                    LaySummary: {},
                }
            }
        }
    }

    const result = await client.search({
        index: 'grants',
        _source: [
            'GrantID',
            'GrantTitleEng',
            'Abstract',
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

    return Response.json(result)
}
