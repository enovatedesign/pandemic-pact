"use client"

import { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/solid"

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

    const titleClasses = [
        'text-secondary uppercase tracking-widest text-3xl'
    ].join(' ')

    const [abstractShow, setAbstractShow] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    return (
        <div className="bg-gradient-to-b from-primary/50 to-white to-50%">
            <Layout title={grant.GrantTitleEng} >
                <div className="container mx-auto my-12 relative">
                    
                    <Link href="#" className="absolute bg-secondary rounded-full px-4 h-8 -top-4 right-12 md:px-8 md:h-14 md:-top-7 md:right-20 lg:right-28 flex items-center border-2 border-secondary hover:border-primary transition duration-300">
                        <div className="uppercase text-white flex items-center space-x-2 lg:space-x-4">
                            <p className="border-2 border-white p-.5 rounded-full">
                                <ChevronLeftIcon className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 -translate-x-[1px] "/>
                            </p>
                            <p className="text-sm md:text-lg lg:text-xl">
                                Grant search
                            </p>
                        </div>
                    </Link>

                    <Grid numItemsLg={1} className="gap-6">
                        <Col
                            numColSpanLg={1}
                            className="flex flex-col gap-6 bg-white p-4 md:p-6 lg:p-12 rounded-2xl border-4 border-text-tremor-emphasis"
                        >
                            <div className="grant-abstract flex flex-col space-y-4">
                                <Title className={titleClasses}>Abstract</Title>
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
                                    <span className='inline-flex text-secondary'>
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
                                <div className='flex flex-col space-y-4'>
                                    <Title className={titleClasses}>Publications</Title>

                                    <div className='bg-primary/20 p-4 lg:p-6  rounded-2xl'>

                                        <div className="">
                                            {grant.PubMedLinks.map((link: any, index: number) => {

                                                const handleClick = () => {
                                                    activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                                                }

                                                return (
                                                    <div
                                                        key={index}
                                                    >
                                                        <div className="flex items-center justify-between space-x-2">
                                                            <p
                                                                className="text-left font-bold tracking-wider text-md md:text-xl lg:text-2xl text-tremor-content-emphasis"
                                                                dangerouslySetInnerHTML={{__html: link.title}}
                                                            />
                                                            <button onClick={handleClick} className='w-auto uppercase text-tremor-emphasis tracking wider text-lg flex space-x-2 items-center'>
                                                                <ChevronDownIcon className={`${activeIndex === index && "-rotate-180"} transition duration-300 w-12 h-12`}/>
                                                            </button>
                                                        </div>
                                                        
                                                        <AnimateHeight
                                                            duration={300}
                                                            height={activeIndex === index ? 'auto' : 0}
                                                        >  
                                                            <div className="flex flex-col gap-y-4 lg:gap-y-8 pt-4 lg-pt-8">
                                                                <div>
                                                                    <Subtitle className="uppercase">Authors</Subtitle>
                                                                    <Text className='tracking-wider text-tremor-content-emphasis'>{link.authorString}</Text>
                                                                </div>
    
                                                                <div>
                                                                    <Subtitle className="uppercase">Publish Year</Subtitle>
                                                                    <Text className='tracking-wider text-tremor-content-emphasis'>{link.pubYear}</Text>
                                                                </div>
    
                                                                {link.journalInfo?.journal?.title &&
                                                                    <div>
                                                                        <Subtitle className="uppercase">Journal</Subtitle>
                                                                        <Text className='tracking-wider text-tremor-content-emphasis'>{link.journalInfo.journal.title}</Text>
                                                                    </div>
                                                                }
    
                                                                <div>
                                                                    <Subtitle className="uppercase">DOI</Subtitle>
                                                                    <Text className='tracking-wider text-tremor-content-emphasis'>{link.doi}</Text>
                                                                </div>
                                                                
                                                                <div className="py-4">
                                                                    <Link
                                                                        href={`https://europepmc.org/article/${link.source}/${link.pmid}`}
                                                                        className="text-left text-white bg-secondary p-4 rounded-full uppercase border-2 border-secondary hover:border-primary transition duration-300"
                                                                    >
                                                                        View at Europe PMC
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </AnimateHeight>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
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
