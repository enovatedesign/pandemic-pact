'use client'

import ItemsPerPageSelect from './ItemsPerPageSelect'
import SearchResult from './SearchResult'
import { SearchParameters, SearchResponse } from '../helpers/search'
import { links } from '../helpers/nav'

import '../css/components/highlighted-search-results.css'

interface Props {
    searchParameters: SearchParameters
    setSearchParameters: (searchParameters: SearchParameters) => void
    searchResponse: SearchResponse
}

export default function ResultsTable({
    searchParameters,
    setSearchParameters,
    searchResponse,
}: Props) {
    const setLimit = (limit: number) => {
        setSearchParameters({ ...searchParameters, limit })
    }

    return (
        <div>
            <div className="w-full flex items-center justify-between">
                <h2
                    id="searchResultsHeading"
                    className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-bold"
                >
                    Results
                </h2>

                <ItemsPerPageSelect
                    limit={searchParameters.limit}
                    setLimit={setLimit}
                />
            </div>

            <div className="mt-4 flex flex-col space-y-8 lg:space-y-12 bg-white p-4 md:p-6 lg:p-8 rounded-xl border-2 border-gray-200">
                {searchResponse.hits.map((result: any, index: number) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const linkClasses =
                        'underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl'

                    const grantIndex = searchParameters.page
                        ? (searchParameters.page - 1) * searchParameters.limit +
                          1 +
                          index
                        : index + 1
                    
                    return (
                        <article
                            key={result._id}
                            className="flex flex-col space-y-2 lg:space-y-6"
                        >
                            <div>
                                <h3 className="flex gap-2 items-start">
                                    <span className="block text-gray-500 font-semibold lg:text-2xl">
                                        {grantIndex}.
                                    </span>{' '}
                                    {result.highlight?.GrantTitleEng ? (
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

                            <SearchResult result={result} href={href} />
                        </article>
                    )
                })}
            </div>
        </div>
    )
}
