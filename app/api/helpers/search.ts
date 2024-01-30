import {NextResponse} from 'next/server'
import fs from 'fs'
import {Client} from '@elastic/elasticsearch'

export function getIndexName() {
    const prefix = process.env.SEARCH_INDEX_PREFIX ?
        `${process.env.SEARCH_INDEX_PREFIX}-` :
        ''

    return `${prefix}grants`
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
    const parameters = await request.json()

    const errors = []

    if (typeof parameters.q === 'undefined') {
        errors.push({
            field: 'q',
            message: 'The q parameter is required',
        });
    }

    if (typeof parameters.q !== 'string') {
        errors.push({
            field: 'q',
            message: 'The q parameter must be a string',
        });
    }

    if (typeof parameters.filters === 'undefined') {
        errors.push({
            field: 'filters',
            message: 'The filters parameter is required',
        });
    }

    if (typeof parameters.filters !== 'object') {
        errors.push({
            field: 'filters',
            message: 'The filters parameter must be an object',
        });
    }

    Object.entries(parameters.filters).forEach(
        ([key, value]) => {
            const isStringArray = Array.isArray(value) && value.every(
                (item) => typeof item === 'string'
            )

            if (!isStringArray) {
                errors.push({
                    field: `filters.${key}`,
                    message: `The filters.${key} parameter must be an array of strings`,
                });
            }
        }
    )

    if (errors.length > 0) {
        return {
            errorResponse: NextResponse.json({
                errors,
            }, {
                status: 400,
                statusText: 'Bad Request',
            })
        }
    }

    return {values: parameters}
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
    if (
        !process.env.ELASTIC_HOST ||
        !process.env.ELASTIC_USERNAME ||
        !process.env.ELASTIC_PASSWORD
    ) {
        return null
    }

    const tlsOptions = process.env.ELASTIC_HOST?.includes('://localhost') ? {
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        }
    } : {}

    return new Client({
        node: process.env.ELASTIC_HOST,
        auth: {
            username: process.env.ELASTIC_USERNAME as string,
            password: process.env.ELASTIC_PASSWORD as string,
        },
        ...tlsOptions,
    })
}
