'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isEqual } from 'lodash'

import {
    prepareInitialSearchParameters,
    updateUrlQueryString,
    searchRequest,
    CtSearchParameters,
    CtSearchResponse,
} from './search'
import { AnnouncementProps } from '../../helpers/types'

import Layout from '../../components/Layout'
import ClinicalTrialsSearchInput from './ClinicalTrialsSearchInput'
import ClinicalTrialsResultsTable from './ClinicalTrialsResultsTable'
import SearchPagination from '../../components/SearchPagination'
import ClinicalTrialsCoverageInfoModal from '../ClinicalTrialsCoverageInfoModal'

interface Props {
    announcement: AnnouncementProps
}

export default function ExplorePageClient({ announcement }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [searchParameters, setSearchParameters] = useState<CtSearchParameters>(
        prepareInitialSearchParameters(searchParams),
    )

    const updateSearchParameters = (newSearchParameters: CtSearchParameters) => {
        setSearchParameters(oldSearchParameters => {
            // Page should be reset if any search parameter other than `page` has changed
            const pageShouldBeReset = Object.entries(newSearchParameters)
                .filter(([key]) => key !== 'page')
                .some(
                    ([key, value]) =>
                        !isEqual(
                            value,
                            oldSearchParameters[key as keyof CtSearchParameters],
                        ),
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

    const [searchResponse, setSearchResponse] = useState<CtSearchResponse>({
        hits: [],
        query: '',
        total: { value: 0 },
    })

    const searchRequestBody = useMemo(() => {
        let filters

        if (showAdvancedSearch) {
            // Advanced Search Filters are already in the format expected by the API
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
                    }),
                ),
            }
        }

        return {
            q: searchParameters.q,
            page: searchParameters.page,
            limit: searchParameters.limit,
            coLocatedLocation: searchParameters.coLocatedLocation,
            coLocatedInstitution: searchParameters.coLocatedInstitution,
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

        updateUrlQueryString(url, searchParameters)

        router.replace(url.href)
    }, [searchParams, pathname, router, searchParameters])

    return (
        <Layout
            title="Clinical Research Registrations Search"
            showSummary={true}
            summary={
                <p className="mt-2 text-white/50 lg:text-xl">
                    Find, filter and explore registered clinical trials for infectious
                    diseases with a pandemic potential.{' '}
                    <ClinicalTrialsCoverageInfoModal
                        customButtonClasses="inline-flex align-middle"
                        iconSize="size-5 lg:size-6"
                    />
                </p>
            }
            announcement={announcement}
        >
            <div className="container mx-auto my-6 lg:my-12">
                <div className="flex flex-col space-y-6 lg:space-y-8 mt-6">
                    <div>
                        <Suspense fallback={<div>Loading...</div>}>
                            <ClinicalTrialsSearchInput
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
                        <ClinicalTrialsResultsTable
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
