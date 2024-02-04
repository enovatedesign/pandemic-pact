"use client"

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import StaticPage from './StaticPage'
import {searchRequest} from '../../helpers/search'

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

        searchRequest('show', {
            q: searchQueryFromUrl,
            filters: {
                logicalAnd: false,
                filters: [
                    {
                        field: 'GrantID',
                        values: [grant.GrantID],
                        logicalAnd: false,
                    }
                ]
            },
        }).then(data => {
            const hit = data.hits[0]

            setSearchableFieldResults({
                GrantTitleEng: hit.highlight.GrantTitleEng ?? grant.GrantTitleEng,
                Abstract: hit.highlight.Abstract ?? grant.Abstract,
                LaySummary: hit.highlight.LaySummary ?? grant.LaySummary,
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
