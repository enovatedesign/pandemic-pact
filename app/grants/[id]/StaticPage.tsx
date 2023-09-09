import {Grid, Col, Card, Title, Flex, Text, Metric} from '@tremor/react'
import Layout from "../../components/Layout"

interface Props {
    grant: any
}

export default function StaticPage({grant}: Props) {
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
                dangerouslySetInnerHTML={{__html: grant.GrantTitleEng}}
            />

            <Grid numItemsLg={6} className="gap-6 mt-6">
                <Col numColSpanLg={4}>
                    <Card className="h-full">
                        <Title>Abstract</Title>

                        <div
                            className="mt-2"
                            dangerouslySetInnerHTML={{__html: grant.Abstract}}
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
