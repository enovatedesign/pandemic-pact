'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isEqual } from 'lodash'

import {
    advancedJointFunding,
    buildAdvancedSearchFilters,
    DEEP_LINK_PARAMETERS,
    defaultSearchParameters,
    restoreSearchParameters,
    searchParametersFromDeepLink,
    searchRequest,
    SearchParameters,
    SearchResponse,
} from '../../helpers/search'
import {
    GRANTS_EXPLORE_SCROLL_KEY,
    GRANTS_EXPLORE_STORAGE_KEY,
    persistExploreState,
    readPersistedExploreState,
} from '../../helpers/explore-state'
import { pruneGrantsSearchParameters } from '../../helpers/grants-explore-filters'
import useSearchScrollRestoration from '../../hooks/useSearchScrollRestoration'
import {
    afterCurrentTask,
    isReturnNavigation,
} from '../../helpers/return-navigation'
import { getKvDatabase } from '../../helpers/kv'
import { unpackExploreSharePayload } from '../../helpers/share'
import { AnnouncementProps } from '../../helpers/types'

import Layout from '../../components/Layout'
import SearchInput from '../../components/SearchInput'
import ResultsTable from '../../components/ResultsTable'
import SearchPagination from '../../components/SearchPagination'

// `share` is consumed like the deep links: the state it points at is copied into
// storage on arrival, and leaving it in the URL would override the user's own
// edits every time they came back to the page.
const CONSUMED_PARAMETERS = [...DEEP_LINK_PARAMETERS, 'share']

interface Props {
    announcement: AnnouncementProps
}

export default function ExplorePageClient({announcement}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Read once: stripping it from the URL below must not look like a new link.
    const [sharedStateId] = useState(() => searchParams.get('share'))

    // A deep link — the map's `?filters=` links, a `?q=` back link — describes the
    // whole search, so it takes precedence over whatever was last stored.
    const [deepLinkedParameters] = useState(() => {
        const deepLinked = searchParametersFromDeepLink(searchParams)

        return deepLinked ? pruneGrantsSearchParameters(deepLinked) : null
    })

    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        () => deepLinkedParameters ?? defaultSearchParameters(),
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
                        'grants-explore',
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
                        : readPersistedExploreState(GRANTS_EXPLORE_STORAGE_KEY))

                if (restored) {
                    setSearchParameters(
                        pruneGrantsSearchParameters(
                            restoreSearchParameters(restored, isReturn),
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

        persistExploreState(GRANTS_EXPLORE_STORAGE_KEY, searchParameters)
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
        newSearchParameters: Partial<SearchParameters>,
    ) => {
        setSearchParameters(oldSearchParameters => {
            // Page should be reset if any search parameter other than `page` has changed
            const pageShouldBeReset = Object.entries(newSearchParameters)
                .filter(([key]) => key !== 'page')
                .some(
                    ([key, value]) =>
                        !isEqual(
                            value,
                            oldSearchParameters[key as keyof SearchParameters],
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

    const [searchResponse, setSearchResponse] = useState<SearchResponse>({
        hits: [],
        query: '',
        total: { value: 0 },
    })

    const searchRequestBody = useMemo(() => {
        const filters = searchParameters.showAdvancedSearch
            ? // Advanced Search Filters are derived into the format expected by
              // the API from the row model the UI is built on
              buildAdvancedSearchFilters(searchParameters.advancedSearch)
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

        return {
            q: searchParameters.q,
            page: searchParameters.page,
            limit: searchParameters.limit,
            // Joint funding is a standard-tab control; on the advanced tab it
            // comes from its own row, so neither tab applies the other's.
            jointFunding: searchParameters.showAdvancedSearch
                ? advancedJointFunding(searchParameters.advancedSearch)
                : searchParameters.jointFunding,
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
        GRANTS_EXPLORE_SCROLL_KEY,
        !isLoading && searchResponse.hits.length > 0,
        isReturnVisit,
    )

    return (
        <Layout
            title="Grant Search"
            showSummary={true}
            summary="Find, filter and explore grant abstracts, linked publications and other curated data on research grants for infectious disease with a pandemic potential."
            announcement={announcement}
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
