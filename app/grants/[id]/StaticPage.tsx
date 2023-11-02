"use client"

import { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import { ChevronDownIcon } from "@heroicons/react/solid"

import Link from 'next/link'
import {Accordion, AccordionHeader, AccordionBody, AccordionList, Grid, Col, Card, Title, Subtitle, Flex, Text, Metric, List, ListItem} from '@tremor/react'
import Layout from "../../components/Layout"
import RichText from '@/app/components/ContentBuilder/Common/RichText'

interface Props {
    grant: any
}

export default function StaticPage({grant}: Props) {
    const sidebarItems = [
        {
            text: 'Research Location',
            metric: `${grant.ResearchInstitutionCountry}, ${grant.ResearchInstitutionRegion}`,
        },
        {
            text: 'Disease',
            metric: grant.Disease.join(', '),
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
            metric: grant.FundingOrgName.join(', '),
        },
        {
            text: 'Amount Committed (USD)',
            metric: (typeof grant.GrantAmountConverted === 'number') ?
                `$ ${grant.GrantAmountConverted.toLocaleString()}`
                : grant.GrantAmountConverted,
        },
        {
            text: 'Study Subject',
            metric: grant.StudySubject,
        },
        {
            text: 'Age Groups',
            metric: grant.AgeGroups,
        },
        {
            text: 'Rurality',
            metric: grant.Rurality,
        },
        {
            text: 'Vulnerable Populations',
            metric: grant.VulnerablePopulations,
        },
        {
            text: 'Occupational Groups',
            metric: grant.OccupationalGroups,
        },
        {
            text: 'Study Type',
            metric: grant.StudyType,
        },
        {
            text: 'Clinical Trial',
            metric: grant.ClinicalTrial,
        },
    ]

    if (grant.ResearchInstitutionName.length > 0) {
        sidebarItems.unshift({
            text: 'Lead Research Institution',
            metric: grant.ResearchInstitutionName[0],
        })
    }

    const [abstractShow, setAbstractShow] = useState(false)

    return (
        <div className="bg-gradient-to-b from-primary to-white">
            <Layout title={grant.GrantTitleEng} >
                <div className="container mx-auto my-6 lg:my-12 ">
                    <Grid numItemsLg={1} className="gap-6">
                        <Col
                            numColSpanLg={1}
                            className="flex flex-col gap-6 bg-white p-12 rounded-2xl border-4 border-text-tremor-emphasis"
                        >
                            <div className="grant-abstract flex flex-col space-y-4">
                                <Title className='text-secondary uppercase tracking-widest text-3xl'>Abstract</Title>
                                <AnimateHeight
                                    duration={300}
                                    height={abstractShow ? 'auto' : 100}
                                    className='relative'
                                >  
                                    <RichText text={grant.Abstract} customClasses='min-w-full text-tremor-emphasis tracking-wider'/>
                                    {!abstractShow && (
                                        <div className='absolute inset-0 z-10 top-0 left-0  bg-gradient-to-b from-transparent to-white transition duration-300' />
                                    )}
                                    </AnimateHeight>

                                <button onClick={() => setAbstractShow(!abstractShow)} className='w-auto uppercase text-tremor-emphasis tracking wider text-lg flex space-x-2 items-center'>
                                    <span className='inline-flex '>
                                        {abstractShow ? "read less" : "read more"}
                                    </span>
                                    <ChevronDownIcon className={`${abstractShow && "-rotate-180"} transition duration-300 w-12 h-12`}/>
                                </button>
                            </div>

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
                                                    <p
                                                        className="text-left"
                                                        dangerouslySetInnerHTML={{__html: link.title}}
                                                    />
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

                        {/* <Col numColSpanLg={2}>
                            <div className="space-y-6">
                                {sidebarItems.map(({text, metric}, index) => (
                                    <Card key={index}>
                                        <Flex justifyContent="start" className="space-x-4">
                                            <div className="">
                                                <Text>{text}</Text>
                                                <Metric className="mt-2">{metric}</Metric>
                                            </div>
                                        </Flex>
                                    </Card>
                                ))}
                            </div>
                        </Col> */}
                    </Grid>
                </div>
            </Layout>
        </div>
    )
}
