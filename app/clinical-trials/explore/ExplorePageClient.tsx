'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isEqual } from 'lodash'

import {
    buildCtAdvancedSearchFilters,
    coLocatedFilterOptions,
    DEEP_LINK_PARAMETERS,
    defaultCtSearchParameters,
    restoreCtSearchParameters,
    searchParametersFromDeepLink,
    searchRequest,
    CtSearchParameters,
    CtSearchResponse,
} from './search'
import { pruneCtSearchParameters } from './filter-schema'
import {
    CLINICAL_TRIALS_EXPLORE_SCROLL_KEY,
    CLINICAL_TRIALS_EXPLORE_STORAGE_KEY,
    persistExploreState,
    readPersistedExploreState,
} from '../../helpers/explore-state'
import useSearchScrollRestoration from '../../hooks/useSearchScrollRestoration'
import {
    afterCurrentTask,
    isReturnNavigation,
} from '../../helpers/return-navigation'
import { getKvDatabase } from '../../helpers/kv'
import { unpackExploreSharePayload } from '../../helpers/share'
import { AnnouncementProps } from '../../helpers/types'

import Layout from '../../components/Layout'
import ClinicalTrialsSearchInput from './ClinicalTrialsSearchInput'
import ClinicalTrialsResultsTable from './ClinicalTrialsResultsTable'
import SearchPagination from '../../components/SearchPagination'
import ClinicalTrialsCoverageInfoModal from '../ClinicalTrialsCoverageInfoModal'

// `share` is consumed like the deep links: the state it points at is copied into
// storage on arrival, and leaving it in the URL would override the user's own
// edits every time they came back to the page.
const CONSUMED_PARAMETERS = [...DEEP_LINK_PARAMETERS, 'share']

interface Props {
    announcement: AnnouncementProps
}

export default function ExplorePageClient({ announcement }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Read once: stripping it from the URL below must not look like a new link.
    const [sharedStateId] = useState(() => searchParams.get('share'))

    // A deep link — the geographic distribution `?filters=` links, a `?q=` back
    // link — describes the whole search, so it takes precedence over storage.
    const [deepLinkedParameters] = useState(() => {
        const deepLinked = searchParametersFromDeepLink(searchParams)

        return deepLinked ? pruneCtSearchParameters(deepLinked) : null
    })

    const [searchParameters, setSearchParameters] = useState<CtSearchParameters>(
        () => deepLinkedParameters ?? defaultCtSearchParameters(),
    )

    const [isRestored, setIsRestored] = useState<boolean>(false)

    // Both the page the reader was on and where they were scrolled to only come
    // back on a back or forward, never on a fresh visit.
    const [isReturnVisit, setIsReturnVisit] = useState<boolean>(false)

    /**
     * Filter state is remembered in localStorage, so it can only be read once
     * mounted — the first search waits for it rather than running against the
     * defaults and then again against the restored state.
     */
    useEffect(() => {
        let cancelled = false

        const restore = async () => {
            await afterCurrentTask()

            if (cancelled) {
                return
            }

            const isReturn = isReturnNavigation()

            setIsReturnVisit(isReturn)

            let shared = null

            if (sharedStateId) {
                try {
                    shared = unpackExploreSharePayload(
                        await getKvDatabase(sharedStateId),
                        'clinical-trials-explore',
                    )
                } catch (error) {
                    // An expired or unreachable share link falls back to what
                    // was stored, rather than leaving the page with no results.
                    console.error(error)
                }
            }

            if (cancelled) {
                return
            }

            try {
                const restored =
                    shared ??
                    (deepLinkedParameters
                        ? null
                        : readPersistedExploreState(
                              CLINICAL_TRIALS_EXPLORE_STORAGE_KEY,
                          ))

                if (restored) {
                    setSearchParameters(
                        pruneCtSearchParameters(
                            restoreCtSearchParameters(restored, isReturn),
                        ),
                    )
                }
            } catch (error) {
                // State this malformed can't be repaired, and it would strand
                // the page on a spinner no reload could clear. Fall through to
                // the defaults, which are then persisted over the bad value.
                console.error(error)
            }

            setIsRestored(true)
        }

        restore()

        return () => {
            cancelled = true
        }
    }, [sharedStateId, deepLinkedParameters])

    useEffect(() => {
        if (!isRestored) {
            return
        }

        persistExploreState(
            CLINICAL_TRIALS_EXPLORE_STORAGE_KEY,
            searchParameters,
        )
    }, [isRestored, searchParameters])

    // A consumed entry-point parameter is stripped from the URL: it no longer
    // tracks the filters, so leaving it behind would point at state that has
    // moved on.
    useEffect(() => {
        if (
            !isRestored ||
            !CONSUMED_PARAMETERS.some(parameter => searchParams.has(parameter))
        ) {
            return
        }

        const remainingParameters = new URLSearchParams(searchParams.toString())

        CONSUMED_PARAMETERS.forEach(parameter =>
            remainingParameters.delete(parameter),
        )

        const queryString = remainingParameters.toString()

        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        })
    }, [isRestored, searchParams, pathname, router])

    const updateSearchParameters = (
        newSearchParameters: Partial<CtSearchParameters>,
    ) => {
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
                page: pageShouldBeReset
                    ? 1
                    : newSearchParameters.page ?? oldSearchParameters.page,
            }
        })
    }

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [searchResponse, setSearchResponse] = useState<CtSearchResponse>({
        hits: [],
        query: '',
        total: { value: 0 },
    })

    const searchRequestBody = useMemo(() => {
        const filters = searchParameters.showAdvancedSearch
            ? // Advanced Search Filters are derived into the format expected by
              // the API from the row model the UI is built on
              buildCtAdvancedSearchFilters(searchParameters.advancedSearch)
            : {
                  // Convert the Standard Search Filters into the format expected by the API
                  logicalAnd: true,
                  filters: Object.entries(searchParameters.standardFilters)
                      .filter(([, values]) => (values ?? []).length > 0)
                      .map(([field, values]) => ({
                          field,
                          values,
                          logicalAnd: false,
                      })),
              }

        // The co-located dropdowns are standard-tab controls, so the advanced
        // tab runs without them rather than applying a constraint it can't show.
        const coLocated = searchParameters.showAdvancedSearch
            ? {
                  coLocatedLocation: coLocatedFilterOptions[0].value,
                  coLocatedInstitution: coLocatedFilterOptions[0].value,
              }
            : {
                  coLocatedLocation: searchParameters.coLocatedLocation,
                  coLocatedInstitution: searchParameters.coLocatedInstitution,
              }

        return {
            q: searchParameters.q,
            page: searchParameters.page,
            limit: searchParameters.limit,
            ...coLocated,
            filters,
        }
    }, [searchParameters])

    useEffect(() => {
        if (!isRestored) {
            return
        }

        searchRequest('list', searchRequestBody)
            .then(data => {
                setSearchResponse(data)
                setIsLoading(false)
            })
            .catch(error => {
                console.error(error)
            })
    }, [isRestored, searchRequestBody, setSearchResponse])

    // Results only exist once the page has mounted and the search has run, so
    // a returning user's scroll position can't be restored until then.
    useSearchScrollRestoration(
        CLINICAL_TRIALS_EXPLORE_SCROLL_KEY,
        !isLoading && searchResponse.hits.length > 0,
        isReturnVisit,
    )

    return (
        <Layout
            title="Clinical Research Registrations Search"
            showSummary={true}
            summary={
                // A div, not a p: the info modal renders a Headless UI Dialog
                // (a div) inline here, which the HTML parser would hoist out of a
                // p, breaking hydration.
                <div className="mt-2 text-white/50 lg:text-xl">
                    Find, filter and explore registered clinical trials for infectious
                    diseases with a pandemic potential.{' '}
                    <ClinicalTrialsCoverageInfoModal
                        customButtonClasses="inline-flex align-middle"
                        iconSize="size-5 lg:size-6"
                    />
                </div>
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
