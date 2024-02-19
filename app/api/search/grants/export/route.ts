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

    const { errorResponse, values } = await validateRequest(request)

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters } = values

    const grantIDs = await fetchAllGrantIDsMatchingBooleanQuery(
        client,
        q,
        filters
    )

    return NextResponse.json({ grantIDs })
}
