'use client'

import { useEffect } from 'react'

import Select from 'react-select'
import SearchResult from './SearchResult'
import { SearchResponse } from '../helpers/search'
import { links } from '../helpers/nav'
import { customSelectThemeColours } from '../helpers/select-colours'

import '../css/components/highlighted-search-results.css'

interface Props {
    searchResponse: SearchResponse
    searchResponseHits: any
    pagination: boolean
    limit: number
    setLimit: (limit: number) => void
    pageParam: string | null
}

export default function ResultsTable({
    searchResponse,
    searchResponseHits,
    pagination,
    limit,
    setLimit,
    pageParam,
}: Props) {
    const defaultValue = {
        label: 'Show 25 Grants per page',
        value: limit,
    }

    const paginationSelectOptions = [
        {
            label: 'Show 25 Grants per page',
            value: 25,
        },
        {
            label: 'Show 50 Grants per page',
            value: 50,
        },
        {
            label: 'Show 75 Grants per page',
            value: 75,
        },
        {
            label: 'Show 100 Grants per page',
            value: 100,
        },
    ]

    const handlePaginationChange = (selectedOption: any) => {
        if (selectedOption.value === limit) {
            return
        } else {
            setLimit(selectedOption.value)
        }
    }

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
                        theme={theme => ({
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
                {searchResponseHits.map((result: any, index: number) => {
                    const query = searchResponse.query

                    const href =
                        `${links.explore.href}/${result._id}` +
                        (query ? `?q=${query}` : '')

                    const linkClasses =
                        'underline decoration-primary hover:decoration-secondary font-semibold lg:text-2xl'

                    const grantIndex = pageParam
                        ? (Number(pageParam) - 1) * limit + 1 + index
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

