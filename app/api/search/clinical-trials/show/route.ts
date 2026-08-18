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
    ])

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters } = values

    const dataset = getSearchDataset('clinical-trials')

    let highlightClause = {}

    if (q) {
        const highlightOptions = {
            number_of_fragments: 0,
            pre_tags: ['<span class="highlighted-search-result-token">'],
            post_tags: ['</span>'],
        }

        highlightClause = {
            highlight: {
                encoder: 'html',
                fields: Object.fromEntries(
                    dataset.highlightFields.map(field => [
                        field,
                        highlightOptions,
                    ]),
                ),
            },
        }
    }

    const index = getIndexName(dataset.indexBaseName)

    const query = getBooleanQuery(q, filters, dataset)

    const results = await client.search({
        index,

        _source: dataset.showSourceFields,

        size: 1,

        body: {
            query,
            ...highlightClause,
        },
    })

    return NextResponse.json({
        query: q,
        ...results.body.hits,
    })
}
