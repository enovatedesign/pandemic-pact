'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import SearchInput from '../components/SearchInput'
import ResultsTable from '../components/ResultsTable'
import {
    searchRequest,
    SearchFilters,
    SelectedStandardSearchFilters,
    SearchParameters,
    SearchResponse,
} from '../helpers/search'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SearchPagination from '../components/SearchPagination'

export default function ExplorePageClient() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [searchParameters, setSearchParameters] = useState<SearchParameters>({
        q: searchParams.get('q') ?? '',
        standardFilters: JSON.parse(searchParams.get('filters') ?? '{}'),
        advancedFilters: { logicalAnd: true, filters: [] },
        page: parseInt(searchParams.get('page') ?? '1'),
        limit: parseInt(searchParams.get('limit') ?? '25'),
    })

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

    const [totalHits, setTotalHits] = useState<number>(0)

    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: '',
    })

    const searchResponseHits = searchResponse.hits

    const searchRequestBody = useMemo(() => {
        const filters = showAdvancedSearch
            ? searchParameters.advancedFilters
            : convertStandardFiltersToSearchFilters(
                  searchParameters.standardFilters
              )

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
                setTotalHits(data.total.value)
                setIsLoading(false)
            })
            .catch(error => {
                console.error(error)
            })
    }, [searchRequestBody, setTotalHits, setSearchResponse])

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        url.search = searchParams.toString()

        if (searchParameters.q) {
            url.searchParams.set('q', searchParameters.q)
        } else {
            url.searchParams.delete('q')
        }

        const anyStandardFiltersAreApplied = Object.values(
            searchParameters.standardFilters
        ).some(filter => filter.length > 0)

        if (anyStandardFiltersAreApplied) {
            url.searchParams.set(
                'filters',
                JSON.stringify(searchParameters.standardFilters)
            )
        } else {
            url.searchParams.delete('filters')
        }

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
                                setSearchParameters={setSearchParameters}
                                showAdvancedSearch={showAdvancedSearch}
                                setShowAdvancedSearch={setShowAdvancedSearch}
                                isLoading={isLoading}
                                searchRequestBody={searchRequestBody}
                                totalHits={totalHits}
                            />
                        </Suspense>
                    </div>

                    {searchResponseHits.length > 0 && (
                        <ResultsTable
                            searchParameters={searchParameters}
                            setSearchParameters={setSearchParameters}
                            searchResponse={searchResponse}
                            searchResponseHits={searchResponseHits}
                        />
                    )}

                    {totalHits > searchParameters.limit && (
                        <SearchPagination
                            searchParameters={searchParameters}
                            setSearchParameters={setSearchParameters}
                            totalHits={totalHits}
                        />
                    )}
                </div>
            </div>
        </Layout>
    )
}

function convertStandardFiltersToSearchFilters(
    standardFilters: SelectedStandardSearchFilters
): SearchFilters {
    return {
        logicalAnd: true,
        filters: Object.entries(standardFilters).map(([field, values]) => ({
            field,
            values,
            logicalAnd: false,
        })),
    }
}
