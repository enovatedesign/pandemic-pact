import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SearchIcon } from '@heroicons/react/solid'
import DownloadFullDataButton from './DownloadFullDataButton'
import DownloadFilteredDataButton from './DownloadFilteredDataButton'
import {
    searchRequest,
    SearchFilters,
    SearchResponse,
    queryOrFiltersAreSet,
} from '../helpers/search'
import Button from './Button'
import InfoModal from './InfoModal'
import StandardSearchFilters, {
    SelectedStandardSearchFilters,
} from './StandardSearchFilters'
import AdvancedSearchFilters from './AdvancedSearchFilters'
import LoadingSpinner from './LoadingSpinner'

interface Props {
    setSearchResponse: (searchResponse: SearchResponse) => void
}

export default function SearchInput({ setSearchResponse }: Props) {
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

    return (
        <div>
            <div className="space-y-3">
                <div className="flex gap-x-4">
                    <div className="focus-within:border-primary bg-white px-2 rounded-xl border-2 border-gray-200 pl-4 py-1 md:py-2 text-gray-900 flex items-center justify-between gap-4 w-full">
                        <input
                            type="search"
                            placeholder="Search..."
                            onInput={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => setSearchQuery(event.target.value)}
                            value={searchQuery}
                            className="block w-full placeholder:text-gray-00 text-sm md:text-lg xl:text-xl focus:outline-none focus:"
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
                        <div
                            className={showAdvancedSearch ? 'block' : 'hidden'}
                        >
                            <AdvancedSearchFilters
                                setSearchFilters={setAdvancedSearchFilters}
                            />
                        </div>

                        <div
                            className={showAdvancedSearch ? 'hidden' : 'block'}
                        >
                            <StandardSearchFilters
                                selectedFilters={standardSearchFilters}
                                setSelectedFilters={setStandardSearchFilters}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row gap-4 justify-between justify-start md:items-center">
                    <p className="text-secondary flex flex-row items-center gap-2 uppercase">
                        <span className="whitespace-nowrap">
                            {searchQuery ? 'Total Hits:' : 'Total Grants:'}
                        </span>
                        {isLoading ? (
                            <LoadingSpinner className="w-5 h-5 animate-spin shrink-0" />
                        ) : (
                            <span className="px-2 bg-primary-lightest rounded-lg font-bold text-secondary">
                                {totalHits}
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
