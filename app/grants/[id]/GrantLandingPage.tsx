"use client"

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {Grid, Col, Card, Title, Flex, Text, Metric} from '@tremor/react'
import Layout from "../../components/Layout"
import {meilisearchRequest, highlightedResultsRequestBody} from '../../helpers/meilisearch'

interface SearchableFieldResults {
    GrantTitleEng: string,
    Abstract: string,
}

interface Props {
    grant: any
}

export default function GrantLandingPage({grant}: Props) {
    const [searchableFieldResults, setSearchableFieldResults] = useState<SearchableFieldResults>({
        GrantTitleEng: grant.GrantTitleEng,
        Abstract: grant.Abstract,
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
        }, ['GrantTitleEng', 'Abstract'])

        meilisearchRequest('exports', searchRequestBody).then(data => {
            const hit = data.hits[0]

            setSearchableFieldResults({
                GrantTitleEng: hit._formatted.GrantTitleEng,
                Abstract: hit._formatted.Abstract,
            })
        }).catch((error) => {
            console.error('Error:', error)
        })
    }, [
        searchParams,
        grant,
        setSearchableFieldResults,
    ])

    const sidebarItems = [
        {
            text: 'Amount Awarded (USD)',
            metric: `$ ${grant.GrantAmountConverted.toFixed(2)}`,
        },
        {
            text: 'End Year',
            metric: grant.GrantEndYear,
        },
    ]

    return (
        <Layout>
            <div
                className="mb-6"
                dangerouslySetInnerHTML={{__html: searchableFieldResults.GrantTitleEng}}
            />

            <Grid numItemsLg={6} className="gap-6 mt-6">
                <Col numColSpanLg={4}>
                    <Card className="h-full">
                        <Title>Abstract</Title>

                        <div
                            className="mt-2"
                            dangerouslySetInnerHTML={{__html: searchableFieldResults.Abstract}}
                        />
                    </Card>
                </Col>

                <Col numColSpanLg={2}>
                    <div className="space-y-6">
                        {sidebarItems.map(({text, metric}, index) => (
                            <Card key={index}>
                                <Flex justifyContent="start" className="space-x-4">
                                    <div className="truncate">
                                        <Text>{text}</Text>
                                        <Metric className="truncate mt-2">{metric}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        ))}
                    </div>
                </Col>
            </Grid>
        </Layout>
    )
}
