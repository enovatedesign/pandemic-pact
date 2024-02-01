import {useEffect, useMemo, useState} from 'react'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import {SearchIcon} from '@heroicons/react/solid'
import ExportToCsvButton from './ExportToCsvButton'
import {searchRequest, SearchFilters, SearchResponse} from '../helpers/search'
import Button from './Button'
import AnimateHeight from 'react-animate-height'
import StandardSearchFilters from './StandardSearchFilters'
import AdvancedSearch from './AdvancedSearch'

interface Props {
    setSearchResponse: (searchResponse: SearchResponse) => void
}

export default function SearchInput({setSearchResponse}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchQueryFromUrl = searchParams.get('q') ?? ''

    const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl)

    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        logicalAnd: true,
        filters: [],
    })

    const [totalHits, setTotalHits] = useState<number>(0)

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        if (searchQuery) {
            url.searchParams.set('q', searchQuery)
        } else {
            url.searchParams.delete('q')
        }

        router.replace(url.href)
    }, [searchQuery, pathname, router])

    const searchRequestBody = useMemo(() => {
        return {
            q: searchQuery,
            filters: searchFilters,
        }
    }, [searchQuery, searchFilters])

    useEffect(() => {
        searchRequest('list', searchRequestBody)
            .then(data => {
                setSearchResponse(data)
                setTotalHits(data.total.value)
            }).catch(error => {
                console.error(error)
            })
    }, [searchRequestBody, setTotalHits, setSearchResponse])

    const [advancedSearchShow, setAdvancedSearchShow] = useState(false)

    return (
        <div>
            <div className="space-y-3">
                <div className="focus-within:border-primary bg-white px-2 rounded-xl border-2 border-gray-200 pl-4 py-1 md:py-2 text-gray-900 flex items-center justify-between gap-4">
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

                <section className="w-full rounded-xl border-2 flex flex-col bg-gray-100 p-3">
                    <div className="flex items-center justify-between gap-2 mx-4">
                        <h2 className="text-secondary uppercase tracking-widest font-bold">Search Filters</h2>
                        <div className="flex space-x-1 text-sm text-secondary">
                            <button
                                onClick={() => setAdvancedSearchShow(false)}
                                className={`${!advancedSearchShow
                                    ? 'bg-white rounded-t-lg'
                                    : 'bg-transparent'
                                    } uppercase px-4 py-2 text-xs md:text-sm`}
                            >
                                Standard Search
                            </button>
                            <button
                                onClick={() => setAdvancedSearchShow(true)}
                                className={`${advancedSearchShow
                                    ? 'bg-white rounded-t-lg'
                                    : 'bg-transparent'
                                    } uppercase px-4 py-2 text-xs md:text-sm`}
                            >
                                Advanced Search
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg col-span-2 bg-white p-3">
                        {advancedSearchShow ? (
                            <AnimateHeight
                                duration={400}
                                height={advancedSearchShow && 'auto'}
                            >
                                <AdvancedSearch />
                            </AnimateHeight>
                        ) : (
                            <AnimateHeight
                                duration={400}
                                height={!advancedSearchShow && 'auto'}
                            >
                                <StandardSearchFilters
                                    setSearchFilters={setSearchFilters}
                                />
                            </AnimateHeight>
                        )}
                    </div>
                </section>

                <div className="flex justify-between items-center">
                    <p className="text-secondary flex flex-row item-center gap-2 uppercase">
                        <span>Total Hits:</span>
                        <span className="px-2 bg-primary-lightest rounded-lg font-bold text-secondary">
                            {totalHits}
                        </span>
                    </p>

                    <ExportToCsvButton
                        searchRequestBody={searchRequestBody}
                        filename="search-results-export"
                        title="Download Data"
                        size="xsmall"
                    />
                </div>
            </div>
        </div>
    )
}
