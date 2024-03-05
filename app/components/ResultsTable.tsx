'use client'

import { SearchResponse } from '../helpers/search'
import { links } from '../helpers/nav'
import { useState } from 'react'
import SearchResult from './SearchResult'

import '../css/components/highlighted-search-results.css'

interface Props {
    searchResponse: SearchResponse
}

export default function ResultsTable({ searchResponse }: Props) {
    const [activeIndex, setActiveIndex] = useState(-1)

    return (
        <div>
            <h2 className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-bold">
                Results
            </h2>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {searchResponse.hits.map((result, index) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const linkClasses =
                        'hover:underline font-semibold lg:text-2xl'

                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >   
                            <div>
                                <h3 className="flex gap-2 items-start">
                                    <span className="block text-gray-400 font-semibold lg:text-2xl">{index + 1}.
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
        </div>
    )
}