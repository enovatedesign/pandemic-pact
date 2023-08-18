// TODO only import the specific grant identified by `id` from the dataset if possible?

import {Grid, Col, Card, Title, Subtitle, Flex, Icon, Text, Metric} from '@tremor/react'
import completeDataset from '../../../data/dist/complete-dataset.json'

export async function generateStaticParams() {
    return completeDataset.map((grant: {GrantID: number}) => ({
        id: `${grant.GrantID}`,
    }))
}

export default function Page({params}: {params: {id: string}}) {
    const grant = completeDataset.find((grant: {GrantID: number}) => grant.GrantID === parseInt(params.id))

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
        <Grid numItemsLg={6} className="gap-6 mt-6">
            <Col numColSpanLg={4}>
                <Card className="h-full">
                    <Title>{grant.GrantTitleEng}</Title>

                    <Subtitle className="mt-4">Abstract</Subtitle>
                    <Text className="mt-2">{grant.Abstract}</Text>
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
    )
}
