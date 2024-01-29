import {NextRequest, NextResponse} from 'next/server'

import {
    getIndexName,
    getBooleanQuery,
    getSearchClient,
    searchIsNotEnabled,
    searchUnavailableResponse,
    validateRequest
} from '../../helpers/search'

export async function POST(request: NextRequest) {
    if (searchIsNotEnabled()) {
        return searchUnavailableResponse()
    }

    const {q, filters} = await validateRequest(request)

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
                        ...highlightTags
                    },
                    Abstract: {
                        number_of_fragments: 0,
                        ...highlightTags
                    },
                    LaySummary: highlightTags,
                }
            }
        }
    }

    const client = getSearchClient()

    const index = getIndexName()

    const query = getBooleanQuery(q, filters);

    const results = await client.search({
        index,

        _source: [
            'GrantTitleEng',
            'Abstract',
            'LaySummary',
        ],

        size: 1,

        body: {
            query,
            ...highlightClause,
        }
    })

    return NextResponse.json({
        query: q,
        ...results.hits,
    })
}
