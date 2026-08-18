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
        'coLocatedLocation',
        'coLocatedInstitution',
    ])

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters, coLocatedLocation, coLocatedInstitution } = values

    const trialIDs = await fetchAllIdsMatchingBooleanQuery(
        client,
        q,
        filters,
        getSearchDataset('clinical-trials'),
        undefined,
        { location: coLocatedLocation, institution: coLocatedInstitution },
    )

    return NextResponse.json({ trialIDs })
}
