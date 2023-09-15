"use client"

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import StaticPage from './StaticPage'
import {meilisearchRequest, highlightedResultsRequestBody} from '../../helpers/meilisearch'

interface SearchableFieldResults {
    GrantTitleEng: string,
    Abstract: string,
    LaySummary: string | null,
}

interface Props {
    grant: any
}

export default function GrantLandingPage({grant}: Props) {
    const [searchableFieldResults, setSearchableFieldResults] = useState<SearchableFieldResults>({
        GrantTitleEng: grant.GrantTitleEng,
        Abstract: grant.Abstract,
        LaySummary: grant.LaySummary,
    })

    const searchParams = useSearchParams()

    useEffect(() => {
        const searchQueryFromUrl = searchParams.get('q') ?? ''

        if (!searchQueryFromUrl) {
            return
        }

        const searchRequestBody = highlightedResultsRequestBody({
            q: searchQueryFromUrl,
            filter: `GrantID = ${grant.GrantID}`,
        })

        meilisearchRequest('grants', searchRequestBody).then(data => {
            const hit = data.hits[0]

            setSearchableFieldResults({
                GrantTitleEng: hit._formatted.GrantTitleEng,
                Abstract: hit._formatted.Abstract,
                LaySummary: hit._formatted.LaySummary,
            })
        }).catch((error) => {
            console.error('Error:', error)
        })
    }, [
        searchParams,
        grant,
        setSearchableFieldResults,
    ])

    return (
        <StaticPage
            grant={{
                ...grant,
                ...searchableFieldResults,
            }}
        />
    )
}
