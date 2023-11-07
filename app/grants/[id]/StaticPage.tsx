"use client"

import { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import { ChevronDownIcon, ChevronLeftIcon, ExternalLinkIcon } from "@heroicons/react/solid"
import Link from 'next/link'
import { Grid, Col, Card, Title, Subtitle, Text, } from '@tremor/react'
import Layout from "../../components/Layout"
import RichText from '@/app/components/ContentBuilder/Common/RichText'
import Pagination from '@/app/components/ContentBuilder/Common/Pagination';
import Button from '@/app/components/Button';

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
        'text-secondary uppercase tracking-widest text-3xl font-bold'
    ].join(' ')

    const [abstractShow, setAbstractShow] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    
    const [currentPage, setCurrentPage] = useState(1)
    const lastPost = (currentPage * 3)
    const firstPost = (lastPost - 3)
    const publicationList = grant.PubMedLinks?.slice(firstPost, lastPost)

    const mastheadContent = () => {
        return (
            <>
                <div className="mt-4 flex flex-row justify-between items-center">

                    <ul className="text-xl lg:text-2xl text-gray-300 flex items-center justify-start gap-4">
                        <li>Funded by <span className="font-medium text-primary">{grant.FundingOrgName.join(', ')}</span></li>
                        <li className="flex"><span className="sr-only">Total publications:</span> <span className="inline-block bg-primary px-3 rounded-lg tracking-wider font-bold py-1 text-sm uppercase text-secondary">56 publications</span></li>
                    </ul>

                    <p className="text-gray-500">
                        Grant number: <span className="text-gray-400 font-bold uppercase">{grant.PubMedGrantId}</span>
                    </p>

                </div>
            </>
        )
    }


    return (
        <div className="bg-gradient-to-b from-primary/50 to-white to-50%">
            <Layout title={grant.GrantTitleEng} mastheadContent={mastheadContent()}>
                <div className="container mx-auto my-12 relative">
                    
                    <Link href="/grants" className="absolute right-12 lg:right-20 bg-secondary text-white rounded-full px-4 py-1.5 lg:px-8 lg:py-3 -translate-y-1/2 flex items-center gap-2 border-2 border-secondary hover:border-primary transition-colors duration-300">
                        <div className="aspect-square rounded-full border-2 border-white flex justify-center items-center">
                            <ChevronLeftIcon className="w-4 h-4"/>
                        </div>
                        <span className="uppercase tracking-wider font-medium">Grant search</span>
                    </Link>

                    <Grid numItemsLg={1} className="gap-6">
                        <Col
                            numColSpanLg={1}
                            className="flex flex-col gap-6 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200"
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

                                <button onClick={() => setAbstractShow(!abstractShow)} className='w-auto uppercase font-bold text-tremor-emphasis tracking-wider flex items-center'>
                                    <span className='inline-flex text-secondary'>
                                        {abstractShow ? "read less" : "read more"}
                                    </span>
                                    <ChevronDownIcon className={`${abstractShow && "-rotate-180"} transition duration-300 w-8 h-8`}/>
                                </button>
                            </div>

                            <div className="my-2 lg:my-8 -mx-12 w-[calc(100%+6rem)] md:-mx-10 md:w-[calc(100%+5rem)] lg:-mx-20 lg:w-[calc(100%+10rem)] overflow-hidden">
                                <div className='relative flex flex-col lg:flex-row justify-start items-center w-full bg-secondary md:rounded-2xl overflow-hidden'>
                                    <h3 className='self-start lg:self-auto px-4 py-2 lg:py-0 lg:px-4 text-2xl text-white font-medium uppercase tracking-wider lg:[writing-mode:vertical-lr]'>
                                        Key facts
                                    </h3>
                                    <div className='w-full bg-primary text-secondary'>
                                        <ul className="grid grid-cols-3 bg-gradient-to-t from-secondary/20 to-transparent to-50%">
                                            {keyFactsHeadings.map((heading, index) => {
                                                const borderClasses = [
                                                    index === 1 ? 'border-x-2 border-secondary/10' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} p-4 py-6 flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs tracking-widest font-bold'>
                                                            {heading.text}
                                                        </p>
                                                        <p className='text-md md:text-3xl lg:text-4xl font-bold'>
                                                            {heading.metric}
                                                        </p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <ul className="grid grid-cols-3">
                                            {keyFactsSubHeadings.map((subHeading, index) => {
                                                const borderClasses = [
                                                    index === 1 ? 'border-x-2 border-secondary/10' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} p-4 py-5 flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs tracking-widest font-bold'>
                                                            {subHeading.text}
                                                        </p>
                                                        <p className='font-bold text-lg lg:text-xl'>
                                                            {subHeading.metric}
                                                        </p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <ul className="grid grid-cols-2">
                                            {keyFactsSubCategories.map((category, index) => {
                                                const borderClasses = [
                                                    index === 0 ? 'border-r-2' : ''
                                                ].join(' ')
                                                return (
                                                    <li key={index} className={`${borderClasses} border-t-2 border-secondary/10 p-4 py-5 flex flex-col justify-between space-y-2`}>
                                                        <p className='uppercase text-xs tracking-widest font-bold'>
                                                            {category.text}
                                                        </p>
                                                        <p className='font-bold lg:text-lg'>
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

                                    <div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {publicationList.map((link: any, index: number) => {

                                                const handleClick = () => {
                                                    activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                                                }

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-primary/20 py-4 px-6 rounded-2xl"
                                                    >
                                                        <a className="flex items-center justify-between space-x-2 cursor-pointer" onClick={handleClick}>
                                                            <h3
                                                                className="text-left font-bold tracking-wider text-md md:text-xl lg:text-2xl"
                                                                dangerouslySetInnerHTML={{__html: link.title}}
                                                            ></h3>
                                                            <button className="self-start">
                                                                <ChevronDownIcon className={`${activeIndex === index && "-rotate-180"} transition duration-300 w-10 h-10`}/>
                                                            </button>
                                                        </a>
                                                        
                                                        <AnimateHeight
                                                            duration={300}
                                                            height={activeIndex === index ? 'auto' : 0}
                                                        >  
                                                            <ul className="py-6 flex flex-col gap-4">
                                                                <li className="flex flex-col gap-1">
                                                                    <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">Authors</h4>
                                                                    <p className='tracking-wider text-tremor-content-emphasis'>{link.authorString}</p>
                                                                </li>
                                                                <li className="flex flex-col gap-1">
                                                                    <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">Publish Year</h4>
                                                                    <p className='tracking-wider text-tremor-content-emphasis'>{link.pubYear}</p>
                                                                </li>
                                                                {link.journalInfo?.journal?.title &&
                                                                    <li className="flex flex-col gap-1">
                                                                        <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">Journal</h4>
                                                                        <p className='tracking-wider text-tremor-content-emphasis'>{link.journalInfo.journal.title}</p>
                                                                    </li>
                                                                }
                                                                <li className="flex flex-col gap-1">
                                                                    <h4 className="text-gray-500 uppercase tracking-wider font-bold text-xs">DOI</h4>
                                                                    <p className='tracking-wider text-tremor-content-emphasis'>{link.doi}</p>
                                                                </li>
                                                            </ul>
                                                            <div className="py-4 flex">
                                                                <Button
                                                                    size="small"
                                                                    colour="secondary"
                                                                    href={`https://europepmc.org/article/${link.source}/${link.pmid}`}
                                                                    rel="nofollow noopener noreferrer"
                                                                    target="_blank"
                                                                    customClasses="flex items-center justify-center self-start gap-2"
                                                                >
                                                                    <span>View at Europe PMC</span>
                                                                    <ExternalLinkIcon className="w-5 h-5"/>
                                                                </Button>
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
