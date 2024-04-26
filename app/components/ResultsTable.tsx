'use client'

import { SearchResponse } from '../helpers/search'
import { links } from '../helpers/nav'
import SearchResult from './SearchResult'

import '../css/components/highlighted-search-results.css'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { customSelectThemeColours } from '../helpers/select-colours'
import Pagination from './ContentBuilder/Common/Pagination'

interface Props {
    searchResponse: SearchResponse
}

export default function ResultsTable({ searchResponse }: Props) {

    const searchResponseHits = searchResponse.hits
    const [limit, setLimit] = useState<number>(25)
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit - 1)

    const limitedSearchResponse = searchResponse.hits.slice(0, limit) 
    const [paginatedSearchResponse, setPaginatedEntries] = useState(searchResponseHits.slice(firstItemIndex, lastItemIndex))

    useEffect(() => {
        setPaginatedEntries(searchResponseHits.slice(firstItemIndex, lastItemIndex))
    }, [searchResponseHits, firstItemIndex, lastItemIndex])

    const paginationSelectOptions = [
        {
            label: "25 options per page",
            value: limit,
        },
        {
            label: "50 options per page",
            value: 50,
        }
    ] 

    const handlePaginationChange = (selectedOption: any) => {
        if (selectedOption.value === 25) {
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
                
                <Select
                    options={paginationSelectOptions}
                    onChange={handlePaginationChange}
                    placeholder={paginationSelectOptions[0].label}
                    theme={(theme) => ({
                        ...theme,
                            colors: {
                            ...theme.colors,
                            ...customSelectThemeColours,
                        },
                    })}
                />
            </div>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {paginatedSearchResponse.map((result, index) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const linkClasses =
                        'underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl'

                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >   
                            <div>
                                <h3 className="flex gap-2 items-start">
                                    <span className="block text-gray-500 font-semibold lg:text-2xl">{index + 1}.
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

            {searchResponseHits.length > limitedSearchResponse.length && (
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