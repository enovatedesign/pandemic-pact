'use client'

import { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { SearchIcon, XIcon } from '@heroicons/react/solid'

import Button from '../../components/Button'
import InfoModal from '../../components/InfoModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ClinicalTrialsStandardFilters from './ClinicalTrialsStandardFilters'
import ClinicalTrialsAdvancedFilters from './ClinicalTrialsAdvancedFilters'
import {
    DownloadFullDataButton,
    DownloadFilteredDataButton,
} from './ClinicalTrialsDownloadButtons'
import ExploreShareButton from '../../components/ExploreShareButton'
import {
    CtAdvancedSearchState,
    CtSearchParameters,
    CtStandardFilters,
    CtSearchRequestBody,
    defaultCtAdvancedSearchState,
    queryOrFiltersAreSet,
} from './search'

interface Props {
    searchParameters: CtSearchParameters
    setSearchParameters: (searchParameters: Partial<CtSearchParameters>) => void
    isLoading: boolean
    totalHits: number
    searchRequestBody: CtSearchRequestBody
}

export default function ClinicalTrialsSearchInput({
    searchParameters,
    setSearchParameters,
    isLoading,
    totalHits,
    searchRequestBody,
}: Props) {
    const showAdvancedSearch = searchParameters.showAdvancedSearch

    const [localSearchQuery, setLocalSearchQuery] = useState<string>(
        searchParameters.q,
    )

    // The query the debounce last sent upwards, so a change arriving from outside
    // the input — a shared link loading, or Clear All — can be told apart from the
    // user's own typing and mirrored back into the box.
    const pushedSearchQuery = useRef<string>(searchParameters.q)

    const debouncedSetSearchQuery = useRef(
        debounce((query: string) => {
            pushedSearchQuery.current = query
            setSearchParameters({ q: query })
        }, 200),
    ).current

    useEffect(() => {
        if (searchParameters.q !== pushedSearchQuery.current) {
            pushedSearchQuery.current = searchParameters.q
            setLocalSearchQuery(searchParameters.q)
        }
    }, [searchParameters.q])

    useEffect(() => {
        debouncedSetSearchQuery(localSearchQuery)

        return () => {
            debouncedSetSearchQuery.cancel()
        }
    }, [localSearchQuery, debouncedSetSearchQuery])

    const setShowAdvancedSearch = (showAdvancedSearch: boolean) => {
        setSearchParameters({ showAdvancedSearch })
    }

    const setStandardSearchFilters = (filters: CtStandardFilters) => {
        setSearchParameters({ standardFilters: filters })
    }

    const setCoLocatedLocationFilter = (coLocatedLocation: string) => {
        setSearchParameters({ coLocatedLocation })
    }

    const setCoLocatedInstitutionFilter = (coLocatedInstitution: string) => {
        setSearchParameters({ coLocatedInstitution })
    }

    const setAdvancedSearch = (advancedSearch: CtAdvancedSearchState) => {
        setSearchParameters({ advancedSearch })
    }

    // Clears the tab on screen only — the two tabs hold independent filter sets,
    // and the search query sits outside the panel this button lives in.
    const clearActiveTabFilters = () => {
        setSearchParameters(
            showAdvancedSearch
                ? { advancedSearch: defaultCtAdvancedSearchState() }
                : {
                      standardFilters: {},
                      coLocatedLocation: 'all-trials',
                      coLocatedInstitution: 'all-trials',
                  },
        )
    }

    return (
        <div>
            <div className="space-y-3">
                <div className="flex gap-x-4">
                    <div className="focus-within:border-primary bg-white pl-4 pr-1 md:pr-2 rounded-xl border-2 border-gray-200 py-1 md:py-2 text-gray-900 flex items-center justify-between gap-4 w-full">
                        <input
                            type="search"
                            placeholder="Search..."
                            onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setLocalSearchQuery(event.target.value)
                            }
                            value={localSearchQuery}
                            className="block w-full placeholder:text-gray-400 border-none p-0 text-sm md:text-lg xl:text-xl focus:outline-none focus:border-none focus:ring-0"
                        />

                        <Button
                            size="xsmall"
                            colour="grey"
                            customClasses="flex items-center justify-center self-start gap-2 rounded-lg"
                        >
                            <span className="sr-only">Search</span>
                            <SearchIcon className="w-6 h-6 text-secondary" />
                        </Button>
                    </div>

                    <InfoModal>
                        <h3>Search Operators</h3>

                        <p>
                            By default, search queries are split by whitespace and
                            matched with OR. For example, if you search for{' '}
                            <code>bats dogs</code>, this will match registrations that
                            contain either the word <code>bats</code> or the word{' '}
                            <code>dogs</code> in their title fields.
                        </p>

                        <p>
                            For more complex searches, you can use the following
                            operators:
                        </p>

                        <ul>
                            <li>
                                <code>+</code> the AND operator, which matches both
                                terms, e.g. <code>bats + dogs</code>
                            </li>
                            <li>
                                <code>|</code> the OR operator, which matches either
                                term, e.g. <code>bats | dogs</code>
                            </li>
                            <li>
                                <code>-</code> the NOT operator, which negates the term
                                directly after it, e.g. <code>bats -dogs</code>
                            </li>
                            <li>
                                <code>( )</code> the parentheses operator, which groups
                                terms together for precedence, e.g.{' '}
                                <code>(bats | dogs) + (cats | rats)</code>
                            </li>
                            <li>
                                <code>&quot; &quot;</code> the quotes operator, which
                                matches the exact phrase, e.g.{' '}
                                <code>&quot;bats and dogs&quot;</code>
                            </li>
                            <li>
                                <code>\</code> the escape character, which allows you to
                                search for special characters, e.g.{' '}
                                <code>bat \+ dogs</code>
                            </li>
                        </ul>
                    </InfoModal>
                </div>

                <section className="w-full rounded-xl border-2 flex flex-col bg-gray-100 p-3">
                    <div className="flex items-center justify-between gap-2 mx-4">
                        <h2 className="text-secondary uppercase tracking-widest font-bold">
                            Search Filters
                        </h2>

                        <div className="flex space-x-1 text-sm text-secondary">
                            <button
                                onClick={() => setShowAdvancedSearch(false)}
                                className={`${
                                    !showAdvancedSearch
                                        ? 'bg-white rounded-t-lg'
                                        : 'bg-transparent'
                                } uppercase px-4 py-2 text-xs md:text-sm`}
                            >
                                Standard Search
                            </button>

                            <button
                                onClick={() => setShowAdvancedSearch(true)}
                                className={`${
                                    showAdvancedSearch
                                        ? 'bg-white rounded-t-lg'
                                        : 'bg-transparent'
                                } uppercase px-4 py-2 text-xs md:text-sm`}
                            >
                                Advanced Search
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg col-span-2 bg-white p-3">
                        <div className={showAdvancedSearch ? 'block' : 'hidden'}>
                            <ClinicalTrialsAdvancedFilters
                                advancedSearch={searchParameters.advancedSearch}
                                setAdvancedSearch={setAdvancedSearch}
                            />
                        </div>

                        <div className={showAdvancedSearch ? 'hidden' : 'block'}>
                            <ClinicalTrialsStandardFilters
                                selectedFilters={searchParameters.standardFilters}
                                setSelectedFilters={setStandardSearchFilters}
                                coLocatedLocationFilter={searchParameters.coLocatedLocation}
                                setCoLocatedLocationFilter={setCoLocatedLocationFilter}
                                coLocatedInstitutionFilter={searchParameters.coLocatedInstitution}
                                setCoLocatedInstitutionFilter={setCoLocatedInstitutionFilter}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-3 border-t-2 border-gray-100">
                            <ExploreShareButton
                                kind="clinical-trials-explore"
                                state={searchParameters}
                            />

                            <Button
                                size="xsmall"
                                customClasses="flex items-center gap-1"
                                onClick={clearActiveTabFilters}
                            >
                                Clear All <XIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <p className="text-secondary flex flex-row items-center gap-2 uppercase">
                        <span className="whitespace-nowrap">
                            {searchParameters.q
                                ? 'Total Hits:'
                                : 'Total Registrations:'}
                        </span>
                        {isLoading ? (
                            <LoadingSpinner className="w-5 h-5 animate-spin shrink-0" />
                        ) : (
                            <span className="px-2 bg-primary-lightest rounded-lg font-bold text-secondary">
                                {totalHits.toLocaleString()}
                            </span>
                        )}
                    </p>

                    <div className="flex flex-col md:flex-row gap-4">
                        {queryOrFiltersAreSet(searchRequestBody) && (
                            <DownloadFilteredDataButton
                                searchRequestBody={searchRequestBody}
                            />
                        )}

                        <DownloadFullDataButton />
                    </div>
                </div>
            </div>
        </div>
    )
}
