import {NextResponse} from 'next/server'
import fs from 'fs'
import {Client} from '@elastic/elasticsearch'

export function getIndexName() {
    const prefix = process.env.SEARCH_INDEX_PREFIX ?
        `${process.env.SEARCH_INDEX_PREFIX}-` :
        ''

    return `${prefix}grants`
}

export function searchIsNotEnabled() {
    return typeof process.env.ELASTIC_PASSWORD === 'undefined'
}

export function searchUnavailableResponse() {
    return NextResponse.json({
        error: 'Service Unavailable',
    }, {
        status: 503,
        statusText: 'Service Unavailable',
    })
}

export async function validateRequest(request: Request) {
    // TODO properly validate and parse input - consider using Zod

    const parameters = await request.json()

    return parameters
}

export function getBooleanQuery(q: string, filters: {[key: string]: string[]}) {
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
                ([_, value]) => value.length > 0
            ).map(
                ([key, value]) => ({
                    'terms': {[key]: value}
                })
            )
        }
    }

    return {
        bool: {
            ...mustClause,
            ...filterClause,
        }
    }
}

export function getSearchClient() {
    return new Client({
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD as string,
        },
        // TODO only config tls in dev
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        },
    })
}
