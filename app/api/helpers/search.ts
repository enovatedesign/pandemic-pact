import { NextResponse } from 'next/server'
import { Client } from '@opensearch-project/opensearch'
import { SearchFilters } from '../../helpers/search'

export function getSearchClient() {
    if (
        !process.env.SEARCH_HOST ||
        !process.env.SEARCH_USERNAME ||
        !process.env.SEARCH_PASSWORD
    ) {
        return null
    }

    return new Client({
        node: process.env.SEARCH_HOST,
        auth: {
            username: process.env.SEARCH_USERNAME,
            password: process.env.SEARCH_PASSWORD,
        },
    })
}

export function getIndexName() {
    const prefix = process.env.SEARCH_INDEX_PREFIX
        ? `${process.env.SEARCH_INDEX_PREFIX}-`
        : ''

    return `${prefix}grants`
}

export function searchUnavailableResponse() {
    return NextResponse.json(
        {
            error: 'Service Unavailable',
        },
        {
            status: 503,
            statusText: 'Service Unavailable',
        }
    )
}

export async function validateRequest(request: Request) {
    const parameters = await request.json().catch(() => Promise.resolve({}))
    const errors = []

    if (!parameters.page) {
        parameters.page = 1
    }

    if (typeof parameters.q === 'undefined') {
        errors.push({
            field: 'q',
            message: 'The q parameter is required',
        })
    }

    if (typeof parameters.q !== 'string') {
        errors.push({
            field: 'q',
            message: 'The q parameter must be a string',
        })
    }

    if (typeof parameters.filters === 'undefined') {
        errors.push({
            field: 'filters',
            message: 'The filters parameter is required',
        })
    }

    if (typeof parameters.filters !== 'object') {
        errors.push({
            field: 'filters',
            message: 'The filters parameter must be an object',
        })
    } else {
        // TODO update validation logic to work with advanced filters
        // Object.entries(parameters.filters).forEach(
        //     ([key, value]) => {
        //         const isStringArray = Array.isArray(value) && value.every(
        //             (item) => typeof item === 'string'
        //         )
        //         if (!isStringArray) {
        //             errors.push({
        //                 field: `filters.${key}`,
        //                 message: `The filters.${key} parameter must be an array of strings`,
        //             });
        //         }
        //     }
        // )
    }

    if (typeof parameters.page !== 'number') {
        errors.push({
            field: 'page',
            message: 'The page parameter must be a number',
        })
    }

    if (parameters.page < 0) {
        errors.push({
            field: 'page',
            message: 'The page parameter must be greater than 0',
        })
    }

    if (typeof parameters.limit === 'undefined') {
        errors.push({
            field: 'limit',
            message: 'The limit parameter is required',
        })
    }

    if (typeof parameters.limit !== 'number') {
        errors.push({
            field: 'limit',
            message: 'The limit parameter must be a number',
        })
    }

    if (parameters.limit > 100) {
        errors.push({
            field: 'limit',
            message: 'The limit parameter must be less than or equal to 100',
        })
    }

    if (parameters.limit <= 0) {
        errors.push({
            field: 'limit',
            message: 'The limit parameter must be greater than 0',
        })
    }

    if (errors.length > 0) {
        return {
            errorResponse: NextResponse.json(
                {
                    errors,
                },
                {
                    status: 400,
                    statusText: 'Bad Request',
                }
            ),
        }
    }

    return { values: parameters }
}

export function getBooleanQuery(q: string, filters: SearchFilters) {
    let mustClause = {}

    if (q) {
        let query = q
            .replace(/\bAND\b/g, '+')
            .replace(/\bOR\b/g, '|')
            .replace(/\bNOT\s+/g, '-')

        mustClause = {
            must: {
                simple_query_string: {
                    query,
                    fields: ['GrantTitleEng^4', 'Abstract^2', 'LaySummary'],
                    flags: 'AND|OR|NOT|PHRASE|PRECEDENCE|WHITESPACE|ESCAPE',
                },
            },
        }
    }

    let filterClause = {}

    if (filters) {
        const outerBoolOperator = filters.logicalAnd ? 'must' : 'should'

        filterClause = {
            filter: {
                bool: {
                    [outerBoolOperator]: filters.filters.map(
                        ({ field, values, logicalAnd }) => {
                            const innerBoolOperator = logicalAnd
                                ? 'must'
                                : 'should'

                            return {
                                bool: {
                                    [innerBoolOperator]: values.map(value => ({
                                        term: {
                                            [field]: value,
                                        },
                                    })),
                                },
                            }
                        }
                    ),
                },
            },
        }
    }

    return {
        bool: {
            ...mustClause,
            ...filterClause,
        },
    }
}

export async function fetchAllGrantIDsInIndex(client: Client) {
    return fetchAllGrantIDsMatchingBooleanQuery(client, '', {
        filters: [],
        logicalAnd: false,
    })
}

export async function fetchAllGrantIDsMatchingBooleanQuery(
    client: Client,
    q: string,
    filters: SearchFilters
) {
    const index = getIndexName()

    const query = getBooleanQuery(q, filters)

    const grantIDs = []

    const size = 1000

    let hits = []

    let searchAfterClause = {}

    do {
        const results = await client.search({
            index,

            // Don't return any document because we only need the _id from OpenSearch
            _source: [],

            size,

            body: {
                query,

                sort: [
                    {
                        GrantID: { order: 'asc' },
                    },
                ],

                ...searchAfterClause,
            },
        })

        hits = results.body.hits.hits

        for (const hit of hits) {
            grantIDs.push(hit._id)
        }

        if (hits.length > 0) {
            searchAfterClause = {
                search_after: hits[hits.length - 1].sort,
            }
        }
    } while (hits.length === size)

    return grantIDs
}
