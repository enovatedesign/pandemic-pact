import { NextRequest, NextResponse } from 'next/server'

import {
    getIndexName,
    getBooleanQuery,
    getSearchClient,
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
        'jointFunding',
        'page',
        'limit',
    ])

    if (errorResponse) {
        return errorResponse
    }

    const { q, filters, jointFunding, page, limit } = values

    let highlightClause = {}

    if (q) {
        const highlightTags = {
            pre_tags: ['<span class="highlighted-search-result-token">'],
            post_tags: ['</span>'],
        }

        highlightClause = {
            highlight: {
                encoder: 'html',
                fields: {
                    GrantTitleEng: {
                        number_of_fragments: 0,
                        ...highlightTags,
                    },
                    Abstract: {
                        ...highlightTags,
                    },
                    LaySummary: highlightTags,
                },
            },
        }
    }

    const index = getIndexName()

    const query = getBooleanQuery(q, filters, jointFunding)

    const from = page && limit ? limit * (page - 1) : 0

    const results = await client.search({
        index,

        _source: [
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
            'GrantAmountConverted',
            'GrantStartYear',
            'FundingOrgName',
            'PublicationCount',
            'JointFundedGrants'
        ],

        from: from,
        size: limit,
        track_total_hits: true,

        body: {
            query,
            ...highlightClause,
        },
    })

    return NextResponse.json({
        query: q,
        page: page,
        ...results.body.hits,
    })
}
