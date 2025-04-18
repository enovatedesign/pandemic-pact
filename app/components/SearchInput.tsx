import { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { SearchIcon } from '@heroicons/react/solid'

import {
    queryOrFiltersAreSet,
    SearchFilters,
    SelectedStandardSearchFilters,
    SearchParameters,
} from '../helpers/search'

import DownloadFullDataButton from './DownloadFullDataButton'
import DownloadFilteredDataButton from './DownloadFilteredDataButton'
import Button from './Button'
import InfoModal from './InfoModal'
import StandardSearchFilters from './StandardSearchFilters'
import AdvancedSearchFilters from './AdvancedSearchFilters'
import LoadingSpinner from './LoadingSpinner'

interface Props {
    searchParameters: SearchParameters
    setSearchParameters: (searchParameters: SearchParameters) => void
    showAdvancedSearch: boolean
    isLoading: boolean
    totalHits: number
    setShowAdvancedSearch: (showAdvancedSearch: boolean) => void
    searchRequestBody: any
}

export default function SearchInput({
    searchParameters,
    setSearchParameters,
    showAdvancedSearch,
    isLoading,
    totalHits,
    setShowAdvancedSearch,
    searchRequestBody,
}: Props) {
    const [localSearchQuery, setLocalSearchQuery] = useState<string>("")

    // useRef is used here to store the debounced function so it is not re-created
    // on every render, preventing unnecessary re-creations of the function and 
    // avoiding an infinite loop of state updates caused by `useEffect`.
    const debouncedSetSearchQuery = useRef(
        debounce((query: string) => {
            setSearchParameters(({ ...searchParameters, q: query }));
        }, 200)
    ).current
    
    // This useEffect calls the debounced function whenever `localSearchQuery` changes,
    // ensuring that `setSearchParameters` is only triggered after the debounce period.
    useEffect(() => {
        debouncedSetSearchQuery(localSearchQuery);
    
        return () => {
            debouncedSetSearchQuery.cancel()
        }
    }, [localSearchQuery, debouncedSetSearchQuery])
    
    const handleSearchToggleButtons = (value: boolean) => {
        setShowAdvancedSearch(value)
    }

    const setStandardSearchFilters = (
        filters: SelectedStandardSearchFilters,
    ) => {
        setSearchParameters({
            ...searchParameters,
            standardFilters: filters,
        })
    }

    const setJointFundingFilter = (jointFunding: string) => {
        setSearchParameters({
            ...searchParameters,
            jointFunding,
        })
    }

    const setShowAdvancedSearchFilters = (filters: SearchFilters) => {
        setSearchParameters({
            ...searchParameters,
            advancedFilters: filters,
        })
    }
    
    return (
        <div>
            <div className="space-y-3">
                <div className="flex gap-x-4">
                    <div className="focus-within:border-primary bg-white pl-4 pr-1 md:pr-2 rounded-xl border-2 border-gray-200 py-1 md:py-2 text-gray-900 flex items-center justify-between gap-4 w-full">
                        <input
                            type="search"
                            placeholder="Search..."
                            onInput={(
                                event: React.ChangeEvent<HTMLInputElement>,
                            ) => setLocalSearchQuery(event.target.value)}
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
                            By default, search queries are split by whitespace
                            and matched with OR. For example, if you search for{' '}
                            <code>bats dogs</code>, this will match grants that
                            contain either the word <code>bats</code> or the
                            word <code>dogs</code> in their Title, Abstract or
                            Lay Summary fields.
                        </p>

                        <p>
                            For more complex searches, you can use the following
                            operators:
                        </p>

                        <ul>
                            <li>
                                <code>+</code> the AND operator, which matches
                                both terms, e.g. <code>bats + dogs</code>
                            </li>
                            <li>
                                <code>|</code> the OR operator, which matches
                                either term, e.g. <code>bats | dogs</code>
                            </li>
                            <li>
                                <code>-</code> the NOT operator, which negates
                                the term directly after it, e.g.{' '}
                                <code>bats -dogs</code>
                            </li>
                            <li>
                                <code>( )</code> the parentheses operator, which
                                groups terms together for precedence, e.g.{' '}
                                <code>(bats | dogs) + (cats | rats)</code>
                            </li>
                            <li>
                                <code>&quot; &quot;</code> the quotes operator,
                                which matches the exact phrase, e.g.{' '}
                                <code>&quot;bats and dogs&quot;</code>
                            </li>
                            <li>
                                <code>\</code> the escape character, which
                                allows you to search for special characters,
                                e.g. <code>bat \+ dogs</code>
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
                                onClick={() => handleSearchToggleButtons(false)}
                                className={`${
                                    !showAdvancedSearch
                                        ? 'bg-white rounded-t-lg'
                                        : 'bg-transparent'
                                } uppercase px-4 py-2 text-xs md:text-sm`}
                            >
                                Standard Search
                            </button>

                            <button
                                onClick={() => handleSearchToggleButtons(true)}
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
                        <div
                            className={showAdvancedSearch ? 'block' : 'hidden'}
                        >
                            <AdvancedSearchFilters
                                setSearchFilters={setShowAdvancedSearchFilters}
                                setJointFundingFilter={setJointFundingFilter}
                            />
                        </div>

                        <div
                            className={showAdvancedSearch ? 'hidden' : 'block'}
                        >
                            <StandardSearchFilters
                                selectedFilters={
                                    searchParameters.standardFilters
                                }
                                setSelectedFilters={setStandardSearchFilters}
                                jointFundingFilter={
                                    searchParameters.jointFunding
                                }
                                setJointFundingFilter={setJointFundingFilter}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <p className="text-secondary flex flex-row items-center gap-2 uppercase">
                        <span className="whitespace-nowrap">
                            {searchParameters.q
                                ? 'Total Hits:'
                                : 'Total Grants:'}
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
