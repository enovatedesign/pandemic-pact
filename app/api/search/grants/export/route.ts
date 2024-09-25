import { NextRequest, NextResponse } from 'next/server'

import {
    getSearchClient,
    searchUnavailableResponse,
    validateRequest,
    fetchAllGrantIDsMatchingBooleanQuery,
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

    const grantIDs = await fetchAllGrantIDsMatchingBooleanQuery(
        client,
        q,
        filters,
        jointFunding,
    )

    return NextResponse.json({ grantIDs })
}
