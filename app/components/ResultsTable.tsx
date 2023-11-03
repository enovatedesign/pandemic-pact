"use client"

import '../css/components/results-table.css'
import Link from "next/link"
import {Card, Table} from "@tremor/react"
import {SearchResponse, SearchResult} from "../types/search"
import {links} from "../helpers/nav"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"
import { useState } from 'react'
import AnimateHeight from 'react-animate-height';

interface Props {
    searchResponse: SearchResponse,
}


export default function ResultsTable({searchResponse}: Props) {
    
    const [activeIndex, setActiveIndex] = useState(-1)
    
    return (
        <Card>
            <Table className='container mx-auto'>
                
                <h3 className="font-bold text-2xl lg:text-4xl tracking-wider text-secondary py-8">Results</h3>

                <div className='flex flex-col space-y-8'>
                    {searchResponse.hits.map((result, index) => {
                        const query = searchResponse.query
                        const href = `${links.explore.href}/${result.GrantID}` + (query ? `?q=${query}` : '')
                        const Abstract = result.Abstract
                        const data = {index, activeIndex, setActiveIndex, href, Abstract}

                        return (
                            <div key={result.GrantID}>
                                <div className="flex flex-col gap-y-2">
                                    <div
                                        className="whitespace-normal font-semibold"
                                        dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                    />

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
    href: string,
    Abstract: string,
}

function SearchMatches({result, index, activeIndex, setActiveIndex, href, Abstract}: SearchMatchesProps) {
    
    let matches = [
        {label: "Title", count: result._formatted.GrantTitleEng?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Abstract", count: result._formatted.Abstract?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
        {label: "Lay Summary", count: result._formatted.LaySummary?.match(/class="highlighted-search-result-token">/g)?.length ?? 0},
    ]

    matches.push({
        label: "Total",
        count: matches.reduce((total, {count}) => total + count, 0)
    })

    const matchText = matches.filter(({count}) => count > 0)
        .map(({label, count}) => `${count} in ${label}`)
        .join(', ')
    
    const iconClasses = 'w-6 h-6 text-white'
    
    const handleClick = () => {
        activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
    }

    return (
        <div className='bg-primary/40 p-4 rounded-2xl'>
            <div className="grid grid-cols-4 gap-4 lg:gap-8">
                <div className='flex items-center'>
                    <span className="uppercase">Search Matches</span>: <span className='bg-white p-2 ml-2 rounded-lg'>{matchText}</span>
                </div>

                <button onClick={handleClick} className='col-start-4 col-span-1 uppercase bg-secondary rounded-full tracking wider text-lg flex justify-between space-x-2 items-center px-4 border-2 border-secondary hover:border-primary transition duration-300'>
                    <span className='inline-flex text-white'>
                        see more
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

                    <Link href={href} className="col-span-3 px-8 py-4  bg-white rounded-2xl">
                        <p>
                            {Abstract}
                        </p>
                    </Link>
                </div>
            </AnimateHeight>
        </div>
    )
}
