import Link from 'next/link'
import {Accordion, AccordionHeader, AccordionBody, AccordionList, Grid, Col, Card, Title, Subtitle, Flex, Text, Metric} from '@tremor/react'
import Layout from "../../components/Layout"

interface Props {
    grant: any
}

export default function StaticPage({grant}: Props) {
    const sidebarItems = [
        {
            text: 'Grant ID',
            metric: grant.GrantID,
        },
        {
            text: 'Lead Research Institution',
            metric: `${grant.ResearchInstitutionName[0] ?? 'Unknown'} ${grant.ResearchInstitutionCountry} ${grant.ResearchInstitutionRegion}`,
        },
        {
            text: 'Disease',
            metric: `${grant.Disease.join(', ')}`
        },
        {
            text: 'Start Year',
            metric: grant.GrantStartYear,
        },
        {
            text: 'End Year',
            metric: grant.GrantEndYear,
        },
        {
            text: 'Funder',
            metric: `${grant.FundingOrgName.join(', ')} from ${grant.FunderCountry}`,
        },
        {
            text: 'Amount Committed (USD)',
            metric: (typeof grant.GrantAmountConverted === 'number') ?
                `$ ${grant.GrantAmountConverted.toLocaleString()}`
                : grant.GrantAmountConverted,
        },
    ]

    return (
        <Layout title={grant.GrantTitleEng}>
            <Grid numItemsLg={6} className="mt-6 gap-6">
                <Col
                    numColSpanLg={4}
                    className="flex flex-col gap-6"
                >
                    <Card className="grant-abstract">
                        <Title>Abstract</Title>

                        <div
                            className="mt-2"
                            dangerouslySetInnerHTML={{__html: grant.Abstract}}
                        />
                    </Card>

                    {grant.LaySummary &&
                        <Card className="grant-lay-summary">
                            <Title>Lay Summary</Title>

                            <div
                                className="mt-2"
                                dangerouslySetInnerHTML={{__html: grant.LaySummary}}
                            />
                        </Card>
                    }

                    {grant.PubMedLinks?.length > 0 &&
                        <Card>
                            <Title>Publications</Title>

                            <AccordionList className="mt-2 !shadow-none">
                                {grant.PubMedLinks.map((link: any, index: number) => (
                                    <Accordion
                                        key={index}
                                        className="border-0 rounded-none"
                                    >
                                        <AccordionHeader className="items-start pl-0">
                                            <Text className="text-left text-black">{link.title}</Text>
                                        </AccordionHeader>

                                        <AccordionBody className="flex flex-col pl-0 gap-y-4">
                                            <div>
                                                <Subtitle className="font-bold">Authors</Subtitle>
                                                <Text>{link.authorString}</Text>
                                            </div>

                                            <div>
                                                <Subtitle className="font-bold">Publish Year</Subtitle>
                                                <Text>{link.pubYear}</Text>
                                            </div>

                                            {link.journalInfo?.journal?.title &&
                                                <div>
                                                    <Subtitle className="font-bold">Journal</Subtitle>
                                                    <Text>{link.journalInfo.journal.title}</Text>
                                                </div>
                                            }

                                            <div>
                                                <Subtitle className="font-bold">DOI</Subtitle>
                                                <Text>{link.doi}</Text>
                                            </div>

                                            <Link
                                                href={`https://europepmc.org/article/${link.source}/${link.pmid}`}
                                                className="text-right text-blue-500"
                                            >
                                                View at Europe PMC
                                            </Link>
                                        </AccordionBody>
                                    </Accordion>
                                ))}
                            </AccordionList>
                        </Card>
                    }
                </Col >

                <Col numColSpanLg={2}>
                    <div className="space-y-6">
                        {sidebarItems.map(({text, metric}, index) => (
                            <Card key={index}>
                                <Flex justifyContent="start" className="space-x-4">
                                    <div className="truncate">
                                        <Text>{text}</Text>
                                        <Metric className="mt-2 truncate">{metric}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        ))}
                    </div>
                </Col>
            </Grid >
        </Layout >
    )
}
