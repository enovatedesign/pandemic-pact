"use client"

import { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/solid"

import Link from 'next/link'
import { Grid, Col, Card, Title, Subtitle, Text, } from '@tremor/react'
import Layout from "../../components/Layout"
import RichText from '@/app/components/ContentBuilder/Common/RichText'
import Pagination from '@/app/components/ContentBuilder/Common/Pagination';

interface Props {
    grant: any
}

export default function StaticPage({grant}: Props) {
    
    const keyFactsHeadings = [
        {
            text: 'Disease',
            metric: grant.Disease.join(', '),
        },

        {
            text: 'Start & end year',
            metric: [grant.GrantStartYear, grant.GrantEndYear].join("-"),
        },
        {
            text: 'Amount Committed (USD)',
            metric: (typeof grant.GrantAmountConverted === 'number') ?
                `$ ${grant.GrantAmountConverted.toLocaleString()}`
                : grant.GrantAmountConverted,
        },
    ]

    const keyFactsSubHeadings = [
        {
            text: 'Research Location',
            metric: `${grant.ResearchInstitutionCountry}, ${grant.ResearchInstitutionRegion}`,
        },
        {
            text: 'Lead Research Institution',
            metric: grant.ResearchInstitutionName[0],
        },
        {
            text: 'Research Category',
            metric: 'Lorem Ipsum',
        },
    ]
    
    const keyFactsSubCategories = [
        {
            text: 'Research Subcategory',
            metric: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui diam, feugiat fringilla dignissim id, tempor quis eros.'
        },
        {
            text: 'Pandemic Pact Data Points',
            metric: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui diam, feugiat fringilla dignissim id, tempor quis eros.',
        },
    ]
    
    // Data unused in new design
    // {
    //     text: 'Funder',
    //     metric: grant.FundingOrgName.join(', '),
    // },
    // {
    //     text: 'Study Subject',
    //     metric: grant.StudySubject,
    // },
    
    // {
    //     text: 'Study Type',
    //     metric: grant.StudyType,
    // },
    // {
    //     text: 'Age Groups',
    //     metric: grant.AgeGroups,
    // },
    // {
    //     text: 'Rurality',
    //     metric: grant.Rurality,
    // },
    // {
    //     text: 'Vulnerable Populations',
    //     metric: grant.VulnerablePopulations,
    // },
    // {
    //     text: 'Occupational Groups',
    //     metric: grant.OccupationalGroups,
    // },
    // {
    //     text: 'Clinical Trial',
    //     metric: grant.ClinicalTrial,
    // },

    // if (grant.ResearchInstitutionName.length > 0) {
    //     keyFactsItems.unshift({
    //         text: 'Lead Research Institution',
    //         metric: grant.ResearchInstitutionName[0],
    //     })
    // }

    const titleClasses = [
        'text-secondary uppercase tracking-widest text-3xl'
    ].join(' ')

    const [abstractShow, setAbstractShow] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    
    const [currentPage, setCurrentPage] = useState(1)
    const lastPost = (currentPage * 3)
    const firstPost = (lastPost - 3)
    const publicationList = grant.PubMedLinks?.slice(firstPost, lastPost)


    return (
        <div className="bg-gradient-to-b from-primary/50 to-white to-50%">
            <Layout title={grant.GrantTitleEng} >
                <div className="container mx-auto my-12 relative">
                    
                    <Link href="/grants" className="absolute bg-secondary rounded-full px-4 h-8 -top-4 right-12 md:px-8 md:h-14 md:-top-7 md:right-20 lg:right-28 flex items-center border-2 border-secondary hover:border-primary transition duration-300">
                        <div className="uppercase text-white flex items-center space-x-2 lg:space-x-4">
                            <p className="border-2 border-white p-.5 rounded-full">
                                <ChevronLeftIcon className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 -translate-x-[1px]"/>
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
                                    height={abstractShow ? 'auto' : 230}
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

                            <div className="my-2 lg:my-8 -mx-[5%] overflow-hidden">
                                <div className='relative flex flex-col lg:flex-row justify-start items-center w-full whitespace-nowrap bg-secondary rounded-2xl'>
                                    <h3 className='py-2 lg:py-0 text-2xl  text-white  uppercase lg:block lg:transform lg:-rotate-90'>
                                        Key facts
                                    </h3>
                                    <div className='w-full bg-primary text-secondary rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl'>
                                        <ul className="grid grid-cols-3 bg-gradient-to-t from-secondary/20 to-transparent to-50%">
                                            {keyFactsHeadings.map((heading, index) => {
                                                const borderClasses = [
                                                    index === 1 ? 'border-x-[1px] border-slate-400' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} p-4  flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs whitespace-normal'>
                                                            {heading.text}
                                                        </p>
                                                        <p className='text-md md:text-2xl font-bold whitespace-normal'>
                                                            {heading.metric}
                                                        </p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <ul className="grid grid-cols-3">
                                            {keyFactsSubHeadings.map((subHeading, index) => {
                                                const borderClasses = [
                                                    index === 1 ? 'border-x-[1px] border-slate-400' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} p-4 flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs whitespace-normal'>
                                                            {subHeading.text}
                                                        </p>
                                                        <p className='font-bold whitespace-normal'>
                                                            {subHeading.metric}
                                                        </p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <ul className="grid grid-cols-2">
                                            {keyFactsSubCategories.map((category, index) => {
                                                const borderClasses = [
                                                    index === 0 ? 'border-r-[1px]' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} border-t-[1px] border-slate-400 p-4 flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs whitespace-normal'>
                                                            {category.text}
                                                        </p>
                                                        <p className='font-bold whitespace-normal'>
                                                            {category.metric}
                                                        </p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>

                                        
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

                            {publicationList.length > 0 &&
                                <div className='flex flex-col space-y-4'>
                                    <Title className={titleClasses}>Publications</Title>

                                    <div className=''>

                                        <div className="grid grid-cols-1 gap-8">
                                            {publicationList.map((link: any, index: number) => {

                                                const handleClick = () => {
                                                    activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                                                }

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-primary/20 p-4  rounded-2xl"
                                                    >
                                                        <div className="flex items-start justify-between space-x-2">
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
                                    {grant.PubMedLinks?.length > 3 && (
                                        <Pagination 
                                            totalPosts={grant.PubMedLinks?.length}
                                            postsPerPage={3}
                                            setCurrentPage={setCurrentPage}
                                            currentPage={currentPage}
                                        />
                                    )}
                                </div>

                            }
                        </Col >

                        
                    </Grid>
                </div>
            </Layout>
        </div>
    )
}
