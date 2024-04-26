'use client'

import { SearchResponse } from '../helpers/search'
import { links } from '../helpers/nav'
import SearchResult from './SearchResult'

import '../css/components/highlighted-search-results.css'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { customSelectThemeColours } from '../helpers/select-colours'
import Pagination from './ContentBuilder/Common/Pagination'
import {usePathname, useRouter, useSearchParams} from "next/navigation";

interface Props {
    searchResponse: SearchResponse
}

export default function ResultsTable({ searchResponse }: Props) {

    const searchResponseHits = searchResponse.hits
    const [limit, setLimit] = useState<number>(25)
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit - 1)
    const [pagination, setPagination] = useState<boolean>(false)
    const [paginatedSearchResults, setPaginatedSearchResults] = useState(searchResponseHits.slice(firstItemIndex, lastItemIndex))

    const params = useSearchParams()
    const pageParam = params.get('page')
    

    useEffect(() => {
        setPaginatedSearchResults(searchResponseHits.slice(firstItemIndex, lastItemIndex))
    }, [searchResponseHits, firstItemIndex, lastItemIndex])

    useEffect(() => {
        if (searchResponseHits.length > limit) {
            setPagination(true)
        }
    }, [limit, searchResponseHits.length])
    
    const defaultValue = {
            label: "Show 25 Grants per page",
            value: limit,
        }
    
    const paginationSelectOptions = [
        {
            label: "Show 25 Grants per page",
            value: 25,
        },
        {
            label: "Show 50 Grants per page",
            value: 50,
        },
        {
            label: "Show 75 Grants per page",
            value: 75,
        },
        {
            label: "Show 100 Grants per page",
            value: 100,
        }
    ] 

    const handlePaginationChange = (selectedOption: any) => {
        if (selectedOption.value === limit) {
            return;
        } else {
            setLimit(selectedOption.value);
        }
    };
    
    return (
        <div>
            <div className="w-full flex items-center justify-between">
                <h2 className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-bold">
                    Results
                </h2>
                
                {pagination && (
                    <Select
                        defaultValue={defaultValue}
                        options={paginationSelectOptions}
                        onChange={handlePaginationChange}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                            ...theme.colors,
                            ...customSelectThemeColours,
                            },
                        })}
                    />
                )}
            </div>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {paginatedSearchResults.map((result, index) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const linkClasses =
                        'underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl'
                    
                    const grantIndex = pageParam ? ((Number(pageParam) -1) * limit + 1) + index : index + 1

                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >   
                            <div>
                                <h3 className="flex gap-2 items-start">
                                    <span className="block text-gray-500 font-semibold lg:text-2xl">{grantIndex}.
                                    </span> {result.highlight?.GrantTitleEng ? (
                                        <a
                                            href={href}
                                            className={linkClasses}
                                            dangerouslySetInnerHTML={{
                                                __html: result.highlight
                                                    .GrantTitleEng[0],
                                            }}
                                        ></a>
                                    ) : (
                                        <a href={href} className={linkClasses}>
                                            {result._source.GrantTitleEng}
                                        </a>
                                    )}
                                </h3>
                            </div>

                            <SearchResult 
                                result={result} 
                                href={href}
                            />
                            
                        </article>
                    )
                })}
            </div>
                
            {pagination && (
                <Pagination 
                    totalPosts={searchResponseHits.length}
                    postsPerPage={limit}
                    setFirstItemIndex={setFirstItemIndex}
                    setLastItemIndex={setLastItemIndex}
                />
            )}
        </div>
    )
}