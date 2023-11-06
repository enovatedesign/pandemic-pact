"use client"

import '../css/components/results-table.css'
import Link from "next/link"
import {Card, Table} from "@tremor/react"
import {SearchResponse, SearchResult} from "../types/search"
import {links} from "../helpers/nav"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import RichText from './ContentBuilder/Common/RichText'

interface Props {
    searchResponse: SearchResponse,
}


export default function ResultsTable({searchResponse}: Props) {
    
    const [activeIndex, setActiveIndex] = useState(-1)

    
    return (
        <Card>
            <Table className='container mx-auto'>
                
                <h3 className="font-bold text-2xl lg:text-4xl tracking-wider text-secondary dark:text-primary py-4 lg:py-8">Results</h3>

                <div className='flex flex-col space-y-8'>
                    {searchResponse.hits.map((result, index) => {
                        const query = searchResponse.query
                        const href = `${links.explore.href}/${result.GrantID}` + (query ? `?q=${query}` : '')
                        const data = {index, activeIndex, setActiveIndex}

                        return (
                            <div key={result.GrantID}>
                                <div className="flex flex-col space-y-2">
                                    <a href={href} className="hover:underline">
                                        <div
                                            className="whitespace-normal font-semibold text-base lg:text-xl dark:text-primary/80"
                                            dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                        />
                                    </a>

                                    {searchResponse.query &&
                                        <SearchMatches result={result} {...data}/>
                                    }   
                                </div>

                                <div className="text-right whitespace-nowrap truncate">
                                </div>

                            </div>
                        )
                    })}
                </div>
            </Table>
        </Card >
    )
}

interface SearchMatchesProps {
    result: SearchResult,
    index: number,
    activeIndex: number,
    setActiveIndex: any,
}

function SearchMatches({result, index, activeIndex, setActiveIndex}: SearchMatchesProps) {
    
    let matches = [
        {label: "Title", count: result._formatted.GrantTitleEng?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Abstract", count: result._formatted.Abstract?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Lay Summary", count: result._formatted.LaySummary?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
    ]

    matches.push({
        label: "Total",
        count: matches.reduce((total, {count}) => total + count, 0)
    })

    
    const titleMatchText = matches.filter(label => label.label === "Title")
    .filter(({count}) => count > 0)
    .map(({label, count}) => `${count} in ${label}`)
    
    const abstractMatchText = matches.filter(label => label.label === "Abstract")
    .filter(({count}) => count > 0)
    .map(({label, count}) => `${count} in ${label}`)
    
    const totalMatchText = matches.filter(label => label.label === "Total")
    .filter(({count}) => count > 0)
    .map(({count}) => count)
    
    const matchText = [titleMatchText, abstractMatchText]
    
    const iconClasses = 'w-4 h-4 lg:w-6 lg:h-6 text-white dark:text-secondary'
    
    const handleClick = () => {
        activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
    }

    return (
        <div className='bg-primary/40 p-4 rounded-2xl'>
            <div className="grid grid-rows-3 gap-2 lg:grid-rows-1 lg:grid-cols-4 lg:gap-4 lg:lg:gap-8">
                <div className='flex items-center justify-between lg:justify-start row-start-1 row-span-1 lg:row-start-1 lg:col-start-1 lg:col-span-2'>
                    <span className="uppercase text-sm lg:text-md   dark:text-white">
                        Search Matches:
                    </span>
                    <ul className="flex space-x-2">
                        {matchText.map((text, index) => {
                            return (
                                <>
                                    {text && (
                                        <li key={index} className='bg-white p-2 ml-2 rounded-lg whitespace-nowrap dark:text-primary dark:bg-secondar text-sm lg:text-md'>
                                            {text}
                                        </li>
                                    )}
                                </>
                            ) 
                        })}
                    </ul>
                </div>
                <div className='flex items-center justify-between row-start-2 row-span-1 lg:row-start-1 lg:justify-end lg:col-start-3 lg:col-span-1'>
                    <span className="uppercase text-sm lg:text-md pr-4 dark:text-white">
                        Total Matches:
                    </span>
                    <p className="px-6 py-2 flex items-center justify-center bg-searchResult rounded-lg font-bold text-secondary dark:text-primary dark:bg-secondary">
                        {totalMatchText}
                    </p>
                </div>

                <button onClick={handleClick} className='row-start-3 row-span-1 lg:row-start-1 lg:col-start-4 lg:col-span-1 uppercase bg-secondary rounded-full tracking wider text-lg flex justify-between space-x-2 items-center px-4 border-2 border-secondary dark:border-primary hover:border-primary dark:bg-primary dark:hover:border-secondary transition duration-300'>
                    <span className='inline-flex text-white dark:text-secondary text-sm lg:text-base'>
                        {activeIndex !== index ? 'See more' : 'See less'}
                    </span>
                    {activeIndex !== index ? (
                        <EyeIcon className={iconClasses} />
                    ) : (
                        <EyeOffIcon className={iconClasses} />
                    )}
                </button>
            </div>

            <AnimateHeight
                duration={300}
                height={activeIndex === index ? 'auto' : 0}
            >
                <div className='grid grid-cols-4 gap-4 lg:gap-8 py-4'>

                    <div className="col-span-4 lg:col-span-3 px-8 py-4 bg-white dark:bg-secondary rounded-2xl">
                        <p className="pb-4 uppercase text-secondary  dark:text-primary text-lg">
                            Abstract Exerpt
                        </p>
                        <RichText text={result._formatted.Abstract} customClasses="min-w-full text-tremor-content dark:text-primary" />
                    </div>
                    <div className=' hidden lg:col-start-4 lg:col-span-1 lg:flex lg:flex-col lg:space-y-4'>
                        <div  className="bg-primary text-secondary rounded-2xl p-4 flex flex-col justify-between space-y-2">
                            <p className='uppercase whitespace-normal'>
                                Amount committed (usd)
                            </p>
                            <p className='text-lg md:text-3xl font-bold whitespace-normal'>
                                $7,667
                            </p>
                        </div>
                        <div  className="bg-primary text-secondary rounded-2xl p-4 flex flex-col justify-between space-y-2">
                            <p className='uppercase whitespace-normal'>
                                Start Year
                            </p>
                            <p className='text-lg md:text-3xl font-bold whitespace-normal'>
                                2020
                            </p>
                        </div>

                    </div>
                </div>
            </AnimateHeight>
        </div>
    )
}
