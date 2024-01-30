import {NextRequest, NextResponse} from 'next/server'

import {
    getIndexName,
    getBooleanQuery,
    getSearchClient,
    searchUnavailableResponse,
    validateRequest
} from '../../helpers/search'

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

    let results = null

    let searchAfterClause = {}

    do {
        results = await client.search({
            index,

            // Don't return any document because we only need the _id from elasticsearch
            _source: false,

            size,

            body: {
                query,

                sort: [
                    {GrantID: 'asc'}
                ],

                ...searchAfterClause,
            }
        })

        for (const hit of results.hits.hits) {
            grantIDs.push(hit._id)
        }

        searchAfterClause = {
            search_after: results.hits.hits[
                results.hits.hits.length - 1
            ].sort,
        }
    } while (results.hits.hits.length === size);

    console.log(`Found ${grantIDs.length} grants`);

    return NextResponse.json({
        grantIDs,
    })
}
