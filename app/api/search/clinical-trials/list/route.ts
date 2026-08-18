import { NextRequest, NextResponse } from 'next/server'

import {
    getIndexName,
    getBooleanQuery,
    getSearchClient,
    getSearchDataset,
    searchUnavailableResponse,
    validateRequest,
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
        'page',
        'limit',
    ])

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters, coLocatedLocation, coLocatedInstitution, page, limit } = values

    const dataset = getSearchDataset('clinical-trials')

    let highlightClause = {}

    if (q) {
        const highlightTags = {
            pre_tags: ['<span class="highlighted-search-result-token">'],
            post_tags: ['</span>'],
        }

        highlightClause = {
            highlight: {
                encoder: 'html',
                fields: Object.fromEntries(
                    dataset.highlightFields.map(field => [
                        field,
                        { number_of_fragments: 0, ...highlightTags },
                    ]),
                ),
            },
        }
    }

    const index = getIndexName(dataset.indexBaseName)

    const query = getBooleanQuery(q, filters, dataset, undefined, {
        location: coLocatedLocation,
        institution: coLocatedInstitution,
    })

    const from = page && limit ? limit * (page - 1) : 0

    const searchQuery = {
        index,
        _source: dataset.listSourceFields,
        from: from,
        size: limit,
        track_total_hits: true,
        body: {
            query,
            ...highlightClause,
        },
    }

    const results = await client.search(searchQuery)

    return NextResponse.json({
        query: q,
        page: page,
        ...results.body.hits,
    })
}
