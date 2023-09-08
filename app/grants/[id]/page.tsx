"use client"

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {Grid, Col, Card, Title, Flex, Text, Metric} from '@tremor/react'
import Layout from "../../components/Layout"
import dataset from '../../../data/dist/complete-dataset.json'
import {meilisearchRequest} from '../../helpers/meilisearch'

interface SearchableFieldResults {
    GrantTitleEng: string,
    Abstract: string,
}

export async function generateStaticParams() {
    return (dataset as any).map(
        (grant: any) => ({id: `${grant.GrantID}`})
    )
}

export default function Page({params}: {params: {id: string}}) {
    const grant = (dataset as any).find(
        (grant: any) => grant.GrantID === parseInt(params.id)
    )

    const [searchableFieldResults, setSearchableFieldResults] = useState<SearchableFieldResults>({
        GrantTitleEng: grant.GrantTitleEng,
        Abstract: grant.Abstract,
    })

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

    const searchParams = useSearchParams()
    const searchQueryFromUrl = searchParams.get('q') ?? ''


    if (searchQueryFromUrl) {
        useEffect(() => {
            const searchRequestBody = {
                q: searchQueryFromUrl,
                filter: `GrantID = ${grant.GrantID}`,
                attributesToHighlight: ['GrantTitleEng', 'Abstract'],
                highlightPreTag: "<strong>",
                highlightPostTag: "</strong>",
            }

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
            searchQueryFromUrl,
            grant,
            setSearchableFieldResults,
        ])
    }

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
