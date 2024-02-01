import {NextRequest, NextResponse} from 'next/server'

import {
    getIndexName,
    getBooleanQuery,
    getSearchClient,
    searchUnavailableResponse,
    validateRequest
} from '../../../helpers/search'

export async function POST(request: NextRequest) {
    const client = getSearchClient()

    if (!client) {
        return searchUnavailableResponse()
    }

    const {errorResponse, values} = await validateRequest(request)

    if (errorResponse) {
        return errorResponse
    }

    const {q, filters} = values

    const index = getIndexName()

    const query = getBooleanQuery(q, filters);

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
                        "GrantID": {order: 'asc'}
                    }
                ],

                ...searchAfterClause,
            }
        })

        hits = results.body.hits.hits

        for (const hit of hits) {
            grantIDs.push(hit._id)
        }

        searchAfterClause = {
            search_after: hits[hits.length - 1].sort,
        }
    } while (hits.length === size);

    console.log(`Found ${grantIDs.length} grants`);

    return NextResponse.json({
        grantIDs,
    })
}
