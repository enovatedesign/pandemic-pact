'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchInput'
import ResultsTable from '../components/ResultsTable'
import {
    searchRequest,
    SearchParameters,
    SearchResponse,
} from '../helpers/search'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SearchPagination from '../components/SearchPagination'

export default function ExplorePageClient() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    interface SearchParameterSchema {
        [key: string]: {
            defaultValue: any
            queryStringParameter?: string
            excludeFromQueryString?: boolean
        }
    }

    const searchParameterSchema: SearchParameterSchema = {
        q: {
            defaultValue: '',
        },
        standardFilters: {
            defaultValue: {},
            queryStringParameter: 'filters',
        },
        advancedFilters: {
            defaultValue: { logicalAnd: true, filters: [] },
            excludeFromQueryString: true,
        },
        page: {
            defaultValue: 1,
        },
        limit: {
            defaultValue: 25,
        },
    }

    const initialSearchParameters = Object.entries(searchParameterSchema).map(
        ([key, schema]) => {
            if (schema.excludeFromQueryString) {
                return [key, schema.defaultValue]
            }

            const searchParamValue = searchParams.get(
                schema.queryStringParameter ?? key
            )

            if (!searchParamValue) {
                return [key, schema.defaultValue]
            }

            if (typeof schema.defaultValue === 'number') {
                return [key, parseInt(searchParamValue)]
            }

            if (typeof schema.defaultValue === 'object') {
                return [key, JSON.parse(searchParamValue)]
            }

            return [key, searchParamValue]
        }
    )

    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        Object.fromEntries(initialSearchParameters)
    )

    const updateSearchParameters = (newSearchParameters: SearchParameters) => {
        setSearchParameters(oldSearchParameters => {
            // Page should be reset if any search parameter other than `page` has changed
            const pageShouldBeReset = Object.entries(newSearchParameters)
                .filter(([key]) => key !== 'page')
                .some(
                    ([key, value]) =>
                        !isEqual(
                            value,
                            oldSearchParameters[key as keyof SearchParameters]
                        )
                )

            return {
                ...oldSearchParameters,
                ...newSearchParameters,
                page: pageShouldBeReset ? 1 : newSearchParameters.page,
            }
        })
    }

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: '',
        total: { value: 0 },
    })

    const searchRequestBody = useMemo(() => {
        let filters

        if (showAdvancedSearch) {
            // Advanced Search Filters are already in the format expected by the API
            // so no conversion needed
            filters = searchParameters.advancedFilters
        } else {
            // Convert the Standard Search Filters into the format expected by the API
            filters = {
                logicalAnd: true,
                filters: Object.entries(searchParameters.standardFilters).map(
                    ([field, values]) => ({
                        field,
                        values,
                        logicalAnd: false,
                    })
                ),
            }
        }

        return {
            q: searchParameters.q,
            page: searchParameters.page,
            limit: searchParameters.limit,
            filters,
        }
    }, [searchParameters, showAdvancedSearch])

    useEffect(() => {
        searchRequest('list', searchRequestBody)
            .then(data => {
                setSearchResponse(data)
                setIsLoading(false)
            })
            .catch(error => {
                console.error(error)
            })
    }, [searchRequestBody, setSearchResponse])

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        url.search = searchParams.toString()

        Object.entries(searchParameterSchema).forEach(([key, schema]) => {
            if (schema.excludeFromQueryString) {
                return
            }

            const stateValue = searchParameters[key as keyof SearchParameters]

            if (schema.defaultValue === stateValue) {
                url.searchParams.delete(key)
                return
            }

            const value =
                typeof stateValue === 'object'
                    ? JSON.stringify(stateValue)
                    : `${stateValue}`

            url.searchParams.set(schema.queryStringParameter ?? key, value)
        })

        router.replace(url.href)
    }, [searchParams, pathname, router, searchParameters])

    return (
        <Layout
            title="Grant Search"
            showSummary={true}
            summary="Find, filter and explore grant abstracts, linked publications and other curated data on research grants for infectious disease with a pandemic potential."
        >
            <div className="container mx-auto my-6 lg:my-12">
                <div className="flex flex-col space-y-6 lg:space-y-8 mt-6">
                    <div>
                        {/*
                        Note that the `Suspense` here is to suppress the following error:
                        https://nextjs.org/docs/messages/deopted-into-client-rendering
                        TODO work out what to do with the `Suspense` `fallback`
                        */}
                        <Suspense fallback={<div>Loading...</div>}>
                            <SearchInput
                                searchParameters={searchParameters}
                                setSearchParameters={updateSearchParameters}
                                showAdvancedSearch={showAdvancedSearch}
                                setShowAdvancedSearch={setShowAdvancedSearch}
                                isLoading={isLoading}
                                searchRequestBody={searchRequestBody}
                                totalHits={searchResponse.total.value}
                            />
                        </Suspense>
                    </div>

                    {searchResponse.hits.length > 0 && (
                        <ResultsTable
                            searchParameters={searchParameters}
                            setSearchParameters={updateSearchParameters}
                            searchResponse={searchResponse}
                        />
                    )}

                    {searchResponse.total.value > searchParameters.limit && (
                        <SearchPagination
                            searchParameters={searchParameters}
                            setSearchParameters={updateSearchParameters}
                            totalHits={searchResponse.total.value}
                        />
                    )}
                </div>
            </div>
        </Layout>
    )
}
