import { NextRequest, NextResponse } from 'next/server'

import {
    getSearchClient,
    getSearchDataset,
    searchUnavailableResponse,
    validateRequest,
    fetchAllIdsMatchingBooleanQuery,
} from '../../../helpers/search'

export async function POST(request: NextRequest) {
    const client = getSearchClient()

    if (!client) {
        return searchUnavailableResponse()
    }

    const { errorResponse, values } = await validateRequest(request, [
        'q',
        'filters',
        'jointFunding',
    ])

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters, jointFunding } = values

    const grantIDs = await fetchAllIdsMatchingBooleanQuery(
        client,
        q,
        filters,
        getSearchDataset('grants'),
        jointFunding,
    )

    return NextResponse.json({ grantIDs })
}
