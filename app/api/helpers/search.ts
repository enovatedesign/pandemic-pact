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
    const rules = {
        q: (addError: (message: string) => void) => {
            if (typeof parameters.q !== 'string') {
                addError('The q parameter must be a string')
            }
        },
        filters: (addError: (message: string) => void) => {
            if (typeof parameters.filters !== 'object') {
                addError('The filters parameter must be an object')
            }
        },
        page: (addError: (message: string) => void) => {
            if (typeof parameters.page !== 'number') {
                addError('The page parameter must be a number')
            }

            if (parameters.page < 0) {
                addError('The page parameter must be greater than 0')
            }
        },
        limit: (addError: (message: string) => void) => {
            if (typeof parameters.limit !== 'number') {
                addError('The limit parameter must be a number')
            }

            if (parameters.limit > 100) {
                addError(
                    'The limit parameter must be less than or equal to 100'
                )
            }

            if (parameters.limit <= 0) {
                addError('The limit parameter must be greater than 0')
            }
        },
    }

    const parameters = await request.json().catch(() => Promise.resolve({}))

    const allErrors: any = {}

    const values: any = {}

    for (const [field, rule] of Object.entries(rules)) {
        if (parameters[field] === undefined) {
            continue
        }

        const errors: any = []

        const addError = (message: string) => {
            errors.push(message)
        }

        rule(addError)

        if (errors.length > 0) {
            allErrors[field] = errors
        } else {
            values[field] = parameters[field]
        }
    }

    if (Object.keys(allErrors).length > 0) {
        return {
            errorResponse: NextResponse.json(
                {
                    allErrors,
                },
                {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                }
            ),
        }
    }

    return { values }
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
