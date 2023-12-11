"use client"

import {useState, useEffect} from 'react'
import AnimateHeight from 'react-animate-height';
import {ChevronDownIcon, ChevronLeftIcon, ExternalLinkIcon, ArrowRightIcon} from "@heroicons/react/solid"
import Link from 'next/link'
import {Grid, Col, Card, Title, Subtitle, Text, } from '@tremor/react'
import Layout from "../../components/Layout"
import RichText from '@/app/components/ContentBuilder/Common/RichText'
import Pagination from '@/app/components/ContentBuilder/Common/Pagination';
import Button from '@/app/components/Button';
import '../../css/components/results-table.css'
import {debounce} from 'lodash';
import InfoModal from "../../components/InfoModal"

interface Props {
    grant: any
}

export default function StaticPage({grant}: Props) {

    const keyFactsHeadings = [
        {
            text: 'Disease',
            metric: grant.Disease.join(', '),
            classes: ''
        },

        {
            text: 'Start & end year',
            startMetric: grant.GrantStartYear,
            endMetric: grant.GrantEndYear,
            classes: ''
        },
        {
            text: 'Amount Committed (USD)',
            metric: (typeof grant.GrantAmountConverted === 'number') ?
                `$ ${grant.GrantAmountConverted.toLocaleString()}`
                : grant.GrantAmountConverted,
            classes: ''
        },
        {
            text: 'Research Location',
            metric: `${grant.ResearchInstitutionCountry}, ${grant.ResearchInstitutionRegion}`,
            classes: ''
        },
        {
            text: 'Lead Research Institution',
            metric: grant.ResearchInstitutionName,
            classes: ''
        },
        {
            text: 'Partner Institution',
            metric: '',
            classes: ''
        },
    ]

    const filteredKeyFactsHeadings = keyFactsHeadings.filter(heading => heading.metric || heading.startMetric)

    const keyFactsSubHeadings = [
        {
            text: 'Research Category',
            metric: grant.ResearchCat[0],
        },
        {
            text: 'Research Subcategory',
            metric: grant.ResearchSubcat[0],
        },
        {
            text: 'Special Interest Tags',
            metric: 'Gender',
        },
        {
            text: 'Study Subject',
            metric: grant.StudyType[0],
        },
        {
            text: 'Clinical Trial Details',
            metric: grant.ClinicalTrial[0],
        },
        {
            text: 'Broad Policy Alignment',
            metric: '100 Days Mission',
        },
        {
            text: 'Age Group',
            metric: grant.AgeGroups,
            infoModalText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            text: 'Vulnerable Population',
            metric: grant.VulnerablePopulations,
            infoModalText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            text: 'Occupations of Interest',
            metric: grant.OccupationalGroups,
        }
    ]

    const titleClasses = [
        'text-secondary uppercase tracking-widest text-lg lg:text-xl font-medium'
    ].join(' ')

    const [abstractShow, setAbstractShow] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const limit = 10
    const [firstItemIndex, setFirstItemIndex] = useState(0)
    const [lastItemIndex, setLastItemIndex] = useState(limit - 1)
    const publicationList = grant.PubMedLinks?.slice(firstItemIndex, lastItemIndex)
    const [readMore, setReadMore] = useState(false)
    const [backgroundShow, setBackgroundShow] = useState(true)


    useEffect(() => {
        const abstract = document.getElementById('abstract')
        const checkHeight = () => {
            setReadMore((abstract?.offsetHeight || 0) > 230)
        }

        const debouncedCheckHeight = debounce(checkHeight, 200)

        if (document.readyState === 'complete') {
            checkHeight()
        } else {
            window.addEventListener('load', checkHeight)
        }

        window.addEventListener('resize', debouncedCheckHeight)

        return () => {
            window.removeEventListener('load', checkHeight)
            window.removeEventListener('resize', debouncedCheckHeight)
        }
    }, [readMore])

    useEffect(() => {
        const handleBackground = () => {
            if (readMore) {
                setBackgroundShow(true)
            } else {
                setBackgroundShow(false)
            }
        }

        const debouncedBackground = debounce(handleBackground, 200)

        if (document.readyState === 'complete') {
            handleBackground()
        } else {
            window.addEventListener('load', handleBackground)
        }

        window.addEventListener('resize', debouncedBackground)

        return () => {
            window.removeEventListener('load', handleBackground)
            window.removeEventListener('resize', debouncedBackground)
        }

    }, [backgroundShow, readMore])

    const mastheadContent = () => {
        return (
            <>
                <div className="mt-4 flex flex-col gap-4 md:flex-row items-start justify-between md:items-center">

                    <ul className="text-xl lg:text-2xl text-gray-300 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
                        <li>Funded by <span className="font-medium text-primary">{grant.FundingOrgName.join(', ')}</span></li>
                        <li className="flex">
                            <span className="sr-only">
                                Total publications:
                            </span>
                            <a href="#publications" className="z-10 inline-block bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary">
                                {grant.PubMedLinks?.length ?? '0'} publications
                            </a>

                        </li>
                    </ul>
                    {grant.PubMedGrantId && (
                        <p className="text-white/80">
                            Grant number: <span className="text-white/60 font-bold uppercase">{grant.PubMedGrantId}</span>
                        </p>
                    )}

                </div>
            </>
        )
    }


    return (
        <Layout title={grant.GrantTitleEng} mastheadContent={mastheadContent()}>
            <div className="container mx-auto my-12 relative">

                <Link href="/grants" className="absolute right-12 lg:right-20 bg-secondary text-white rounded-full px-2 py-1 lg:px-4 lg:py-2 -translate-y-1/2 flex items-center gap-2 border-2 border-secondary hover:border-primary transition-colors duration-300">
                    <div className="aspect-square rounded-full border-2 border-white flex justify-center items-center">
                        <ChevronLeftIcon className="w-4 h-4" />
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
                                <div id='abstract'>
                                    <RichText text={grant.Abstract} customClasses='max-w-none' />
                                    {backgroundShow && !abstractShow && (
                                        <div className='absolute inset-0 top-0 left-0  bg-gradient-to-b from-transparent to-white transition duration-300' />
                                    )}
                                </div>
                            </AnimateHeight>
                            {readMore && (
                                <button onClick={() => setAbstractShow(!abstractShow)} className='w-auto uppercase font-bold text-tremor-emphasis tracking-wider flex items-center'>
                                    <span className='inline-flex text-secondary'>
                                        {abstractShow ? "read less" : "read more"}
                                    </span>
                                    <ChevronDownIcon className={`${abstractShow && "-rotate-180"} transition duration-300 w-8 h-8 text-secondary`} />
                                </button>
                            )}
                        </div>

                        <div className="my-2 lg:my-8 -mx-12 w-[calc(100%+6rem)] md:-mx-10 md:w-[calc(100%+5rem)] lg:-mx-20 lg:w-[calc(100%+10rem)] overflow-hidden">
                            <div className='relative flex flex-col lg:flex-row justify-start items-center w-full bg-secondary md:rounded-2xl overflow-hidden'>
                                <h3 className={`self-start lg:self-auto px-4 py-2 lg:py-0 lg:px-4 text-white tracking-wider lg:[writing-mode:vertical-lr] ${titleClasses}`}>
                                    Key facts
                                </h3>
                                <div className='w-full bg-primary text-secondary'>
                                    <ul className="grid grid-cols-2 md:grid-cols-3 bg-gradient-to-t from-secondary/20 to-transparent to-50%">
                                        {filteredKeyFactsHeadings.map((heading, index) => {
                                            const borderClasses = [
                                                index === 0 && 'border-r-2',
                                                index === 2 && 'border-r-2 md:border-l-2',
                                                index === 3 && 'md:border-r-2',
                                                index === 4 && '',
                                                index === 5 && heading.metric && 'border-l-2 -translate-x-0.5 md:translate-x-0',
                                                index > 2 ? 'border-b-2' : 'border-b-2',
                                            ].join(' ')

                                            const metricClasses = [
                                                index > 2 ? 'text-lg lg:text-xl' : 'text-lg md:text-3xl lg:text-4xl font-bold'
                                            ].join(' ')

                                            let colSpanClass = ''

                                            if (index === filteredKeyFactsHeadings.length - 1 && (filteredKeyFactsHeadings.length % 3) !== 0) {
                                                const numberOfMissingItems = keyFactsHeadings.length - filteredKeyFactsHeadings.length
                                                if (numberOfMissingItems !== 0) {
                                                    colSpanClass = `col-span-${numberOfMissingItems + 1} border-r-0`
                                                }
                                            }

                                            return (
                                                <li key={index} className={`${borderClasses} ${colSpanClass} p-4 py-5 flex flex-col justify-between space-y-2  border-secondary/10`}>
                                                    <p className='uppercase text-xs tracking-widest font-bold'>
                                                        {heading.text}
                                                    </p>
                                                    {heading.startMetric && heading.endMetric ? (
                                                        <div className="flex gap-1 items-center ">
                                                            <span className={metricClasses}>
                                                                {grant.GrantStartYear}
                                                            </span>
                                                            <div className='flex gap-1 items-end h-full'>
                                                                <div className='flex items-center gap-1'>
                                                                    <ArrowRightIcon className="w-4 h-4 md:h-5 md:w-5 opacity-50" />
                                                                    <span className='text-md md:text-xl lg:text-2xl font-bold'>
                                                                        {grant.GrantEndYear}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className={`${metricClasses} font-bold`}>{heading.metric}</p>
                                                        </>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    <ul className="grid grid-cols-2 md:grid-cols-3 bg-primary-lightest">
                                        {keyFactsSubHeadings.map((subHeading, index) => {
                                            const borderClasses = [
                                                index === 0 && 'border-r-2 md:border-r-2',
                                                index === 2 && 'border-r-2 md:border-l-2 md:border-r-0',
                                                index === 3 && 'md:border-r-2',
                                                index === 4 && 'border-r-2 md:border-r-0',
                                                index === 5 && 'md:border-l-2',
                                                index === 6 && 'border-r-2',
                                                index === 8 && 'col-span-2 md:col-span-1 md:border-l-2',
                                            ].join(' ')
                                            return (
                                                <li key={index} className={`${borderClasses} border-b-2 p-4 py-5 flex flex-col space-y-2 border-secondary/10`}>

                                                    {subHeading.infoModalText ? (
                                                        <div className="flex items-center space-x-2">
                                                            {subHeading.text && (
                                                                <p className='uppercase text-xs tracking-widest font-bold'>
                                                                    {subHeading.text}
                                                                </p>
                                                            )}
                                                            <InfoModal>
                                                                <p>
                                                                    {subHeading.infoModalText}
                                                                </p>
                                                            </InfoModal>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {subHeading.text && (
                                                                <p className='uppercase text-xs tracking-widest font-bold'>
                                                                    {subHeading.text}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}

                                                    {subHeading.metric && (
                                                        <p className='font-bold text-lg lg:text-xl'>
                                                            {subHeading.metric}
                                                        </p>
                                                    )}

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

                        {publicationList?.length > 0 &&
                            <div className='flex flex-col space-y-4' id="paginationTop">
                                <h2 className={titleClasses} id='publications'>Publications</h2>

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
                                                            <ChevronDownIcon className={`${activeIndex === index && "-rotate-180"} transition duration-300 w-10 h-10`} />
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
                                                                <ExternalLinkIcon className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </AnimateHeight>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {grant.PubMedLinks?.length > 10 && (
                                        <Pagination
                                            totalPosts={grant.PubMedLinks?.length}
                                            postsPerPage={limit}
                                            setLastItemIndex={setLastItemIndex}
                                            setFirstItemIndex={setFirstItemIndex}
                                        />
                                    )}
                                </div>
                            </div>

                        }
                    </Col >


                </Grid>
            </div>
        </Layout>
    )
}
