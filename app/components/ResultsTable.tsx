"use client"

import '../css/components/results-table.css'

import Link from "next/link"
import {Card, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell} from "@tremor/react"
import {SearchResponse, SearchResult} from "../types/search"
import {links} from "../helpers/nav"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid"

interface Props {
    searchResponse: SearchResponse,
}

export default function ResultsTable({searchResponse}: Props) {
    return (
        <Card>
            <Table className='container mx-auto'>
                
                <h3 className="font-bold text-2xl lg:text-4xl tracking-wider text-secondary py-8">Results</h3>

                <div className='flex flex-col space-y-8'>
                    {searchResponse.hits.map((result, index) => {
                        const query = searchResponse.query
                        const href = `${links.explore.href}/${result.GrantID}` + (query ? `?q=${query}` : '')

                        return (
                            <div key={result.GrantID}>
                                <div className="flex flex-col gap-y-2">
                                    <div
                                        className="whitespace-normal font-semibold"
                                        dangerouslySetInnerHTML={{__html: result._formatted.GrantTitleEng}}
                                    />

                                    {searchResponse.query &&
                                        <SearchMatches result={result} />
                                    }
                                </div>

                                <div className="text-right whitespace-nowrap truncate">
                                </div>

                                <div className="text-right whitespace-nowrap truncate align-top">
                                    <Link
                                        href={href}
                                        className="text-blue-500"
                                    >
                                        View Grant
                                    </Link>
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
    result: SearchResult
}

function SearchMatches({result}: SearchMatchesProps) {
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
    
        const iconClasses = 'w-6 h-6 text-primary transition duration-300'
    return (
        <div className=" bg-primary/40 p-4 rounded-2xl flex justify-between items-center">
            <div>
                <span className="uppercase">Search Matches</span>: <span className='bg-white p-2 ml-2 rounded-lg'>{matchText}</span>
            </div>
            <button  className='w-auto uppercase text-tremor-emphasis tracking wider text-lg flex space-x-2 items-center'>
                <span className='inline-flex text-white'>
                    see more
                    <EyeIcon className={iconClasses} />
                </span>

            </button>
        </div>
    )
}
