"use client"

import {Suspense, useState, useEffect, useMemo} from "react"
import Layout from "../components/Layout"
import SearchInput from "../components/SearchInput"
import ResultsTable from "../components/ResultsTable"
import {
    searchRequest,
    SearchFilters,
    SearchResponse,
    queryOrFiltersAreSet,
} from '../helpers/search'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import StandardSearchFilters, {
    SelectedStandardSearchFilters,
} from '../components/StandardSearchFilters'
import SearchPagination from "../components/ContentBuilder/Common/SearchPagination"

export default function ExplorePageClient() {
    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: "",
    })
    
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchQueryFromUrl = searchParams.get('q') ?? ''
    const filtersFromUrl = searchParams.get('filters') ?? null

    const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl)

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [standardSearchFilters, setStandardSearchFilters] =
        useState<SelectedStandardSearchFilters>(
            filtersFromUrl ? JSON.parse(filtersFromUrl) : {}
        )

    const [advancedSearchFilters, setAdvancedSearchFilters] =
        useState<SearchFilters>({
            logicalAnd: true,
            filters: [],
        })

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

    const [totalHits, setTotalHits] = useState<number>(0)

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        url.search = searchParams.toString()

        if (searchQuery) {
            url.searchParams.set('q', searchQuery)
        } else {
            url.searchParams.delete('q')
        }

        const anyStandardFiltersAreApplied = Object.values(
            standardSearchFilters
        ).some(filter => filter.length > 0)

        if (anyStandardFiltersAreApplied) {
            url.searchParams.set(
                'filters',
                JSON.stringify(standardSearchFilters)
            )
        } else {
            url.searchParams.delete('filters')
        }

        router.replace(url.href)
    }, [searchParams, searchQuery, standardSearchFilters, pathname, router])

    const searchRequestBody = useMemo(() => {
        const searchFilters = showAdvancedSearch
            ? advancedSearchFilters
            : convertStandardFiltersToSearchFilters(standardSearchFilters)

        return {
            q: searchQuery,
            filters: searchFilters,
        }
    }, [
        searchQuery,
        standardSearchFilters,
        advancedSearchFilters,
        showAdvancedSearch,
    ])

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

    const [limit, setLimit] = useState<number>(25)
    const [pagination, setPagination] = useState<boolean>(false)
    const [firstItemIndex, setFirstItemIndex] = useState<number>(0)
    const [lastItemIndex, setLastItemIndex] = useState<number>(limit)
    
    const searchResponseHits = searchResponse.hits
    const [paginatedSearchResults, setPaginatedSearchResults] = useState(searchResponseHits.slice(firstItemIndex, lastItemIndex))
    
    const pageParam = searchParams.get('page')
    
    useEffect(() => {
        if (searchResponseHits.length > lastItemIndex) {
            setPagination(true)
        }
    }, [lastItemIndex, searchResponseHits.length, setPagination])
    
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
                                setSearchQuery={setSearchQuery}
                                searchQuery={searchQuery}
                                showAdvancedSearch={showAdvancedSearch}
                                setShowAdvancedSearch={setShowAdvancedSearch}
                                setAdvancedSearchFilters={setAdvancedSearchFilters}
                                isLoading={isLoading}
                                searchRequestBody={searchRequestBody}
                                totalHits={totalHits} 
                                standardSearchFilters={standardSearchFilters}
                                setStandardSearchFilters={setStandardSearchFilters}
                            />
                        </Suspense>
                    </div>

                    {searchResponseHits.length > 0 &&
                        <div>
                            <ResultsTable 
                                searchResponse={searchResponse}
                                searchResponseHits={searchResponseHits}
                                pagination={pagination}
                                limit={limit}
                                setLimit={setLimit}
                                paginatedSearchResults={paginatedSearchResults}
                                setPaginatedSearchResults={setPaginatedSearchResults} 
                                firstItemIndex={firstItemIndex} 
                                lastItemIndex={lastItemIndex}     
                                pageParam={pageParam}                       
                            />
                        </div>
                    }

                    {pagination && (
                        <SearchPagination
                            postsPerPage={limit}
                            totalPosts={searchResponseHits.length}
                            setFirstItemIndex={setFirstItemIndex}
                            setLastItemIndex={setLastItemIndex}
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