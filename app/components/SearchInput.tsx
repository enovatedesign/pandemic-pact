import {useEffect, useMemo, useState} from 'react'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import { Grid, Col } from '@tremor/react'
import {SearchIcon} from "@heroicons/react/solid"
import ExportToCsvButton from "./ExportToCsvButton"
import MultiSelect from "./MultiSelect"
import selectOptions from '../../data/dist/select-options.json'
import {type SearchResponse} from '../types/search'
import {
    meilisearchRequest,
    exportRequestBody,
    highlightedResultsRequestBody,
    type MeilisearchRequestBody
} from '../helpers/meilisearch'
import Button from './Button'
import AnimateHeight from 'react-animate-height'
import AdvancedSearch from './AdvancedSearch'

interface Props {
    setSearchResponse: (searchResponse: SearchResponse) => void,
}

export interface Filters {
    Disease: string[];
    Pathogen: string[];
    ResearchInstitutionCountry: string[];
    ResearchInstitutionRegion: string[];
    FunderCountry: string[];
    FunderRegion: string[];
}

export default function SearchInput({setSearchResponse}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchQueryFromUrl = searchParams.get('q') ?? ''
    const filtersFromUrl = searchParams.get('filters') ?? null

    const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl)

    const [filters, setFilters] = useState<Filters>(
        filtersFromUrl ? JSON.parse(filtersFromUrl) : {
            Disease: [],
            Pathogen: [],
            ResearchInstitutionCountry: [],
            ResearchInstitutionRegion: [],
            FunderCountry: [],
            FunderRegion: [],
        }
    )

    const [totalHits, setTotalHits] = useState<number>(0)

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        if (searchQuery) {
            url.searchParams.set('q', searchQuery)
        } else {
            url.searchParams.delete('q')
        }

        const anyFiltersAreSet = Object.values(filters).some(selectedOptions => selectedOptions.length > 0)

        if (anyFiltersAreSet) {
            url.searchParams.set('filters', JSON.stringify(filters))
        } else {
            url.searchParams.delete('filters')
        }

        router.replace(url.href, {shallow: true})
    }, [
        searchQuery,
        filters,
        pathname,
        router,
    ])

    const sharedRequestBody = useMemo(() => {
        let body: MeilisearchRequestBody = {
            q: searchQuery,
        }

        const filter = []

        if (filters.Disease?.length > 0) {
            filter.push(
                filters.Disease.length === 1 ?
                    `Disease = "${filters.Disease[0]}"` :
                    filters.Disease.map(disease => `Disease = "${disease}"`)
            )
        }

        if (filters.Pathogen?.length > 0) {
            filter.push(
                filters.Pathogen.length === 1 ?
                    `Pathogen = "${filters.Pathogen[0]}"` :
                    filters.Pathogen.map(pathogen => `Pathogen = "${pathogen}"`)
            )
        }

        if (filters.ResearchInstitutionCountry?.length > 0) {
            filter.push(
                filters.ResearchInstitutionCountry.length === 1 ?
                    `ResearchInstitutionCountry = "${filters.ResearchInstitutionCountry[0]}"` :
                    filters.ResearchInstitutionCountry.map(country => `ResearchInstitutionCountry = "${country}"`)
            )
        }

        if (filters.ResearchInstitutionRegion?.length > 0) {
            filter.push(
                filters.ResearchInstitutionRegion.length === 1 ?
                    `ResearchInstitutionRegion = "${filters.ResearchInstitutionRegion[0]}"` :
                    filters.ResearchInstitutionRegion.map(region => `ResearchInstitutionRegion = "${region}"`)
            )
        }

        if (filters.FunderCountry?.length > 0) {
            filter.push(
                filters.FunderCountry.length === 1 ?
                    `FunderCountry = "${filters.FunderCountry[0]}"` :
                    filters.FunderCountry.map(country => `FunderCountry = "${country}"`)
            )
        }

        if (filters.FunderRegion?.length > 0) {
            filter.push(
                filters.FunderRegion.length === 1 ?
                    `FunderRegion = "${filters.FunderRegion[0]}"` :
                    filters.FunderRegion.map(region => `FunderRegion = "${region}"`)
            )
        }

        if (filter.length > 0) {
            body.filter = filter
        }

        return body
    }, [
        searchQuery,
        filters,
    ])

    useEffect(() => {
        const searchRequestBody = highlightedResultsRequestBody(sharedRequestBody)

        meilisearchRequest('grants', searchRequestBody).then(data => {
            setSearchResponse(data)
            setTotalHits(data.estimatedTotalHits)
        }).catch((error) => {
            console.error('Error:', error)
        })
    }, [
        sharedRequestBody,
        setTotalHits,
        setSearchResponse,
    ])

    const [advancedSearchShow, setAdvancedSearchShow] = useState(true)
    return (
        <div>
            <div className="flex flex-col space-y-6 pb-6">
                <h2 className='text-5xl text-secondary font-bold'>
                    Grant search
                </h2>
                <p className='text-tremor-content text-lg'>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
                </p>
            </div>
            <Grid numItems={2} className="gap-2" >
                <Col numColSpan={2}>
                    <div className='w-full  flex items-center relative '>
                        <input
                            type='search'
                            placeholder="Search..."
                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                            value={searchQuery}
                            className="block w-full rounded-md border-0 pl-4 py-1 md:py-2 text-gray-900 shadow-sm ring-2 placeholder:text-gray-400 focus:ring-4 ring-secondary focus:ring-inset text-sm md:text-lg xl:text-xl sm:leading-6"
                        />
                        <SearchIcon className='w-6 h-6 md:w-8 md:h-8 text-secondary absolute right-4'/>
                    </div>
                </Col>

                
                <div className='col-span-2'>
                    <AnimateHeight
                        delay={!advancedSearchShow ? 400 : 0}
                        duration={400}
                        height={advancedSearchShow ? 0 : 'auto'}
                    >   

                        <div  className="grid grid-cols-2 gap-2">
                            <Col>
                                <MultiSelect
                                    options={selectOptions.Disease}
                                    selectedOptions={filters.Disease}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, Disease: selectedOptions})}
                                    placeholder="All Diseases"
                                    className='border-secondary border-2 rounded-xl'
                                />
                            </Col>

                            <Col>   
                                <MultiSelect
                                    options={selectOptions.Pathogen}
                                    selectedOptions={filters.Pathogen}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, Pathogen: selectedOptions})}
                                    placeholder="All Pathogens"
                                    className='border-secondary border-2 rounded-xl'
                                />
                            </Col>
                        

                            <Col>
                                <MultiSelect
                                    options={selectOptions.ResearchInstitutionCountry}
                                    selectedOptions={filters.ResearchInstitutionCountry}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, ResearchInstitutionCountry: selectedOptions})}
                                    placeholder="All Research Institution Countries"
                                    className='border-secondary border-2 rounded-xl'
                                    />
                            </Col>
                            <Col>
                                <MultiSelect
                                    options={selectOptions.Regions}
                                    selectedOptions={filters.ResearchInstitutionRegion}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, ResearchInstitutionRegion: selectedOptions})}
                                    placeholder="All Research Institution Regions"
                                    className='border-secondary border-2 rounded-xl'
                                />
                            </Col>

                            <Col>
                                <MultiSelect
                                    options={selectOptions.FunderCountry}
                                    selectedOptions={filters.FunderCountry}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, FunderCountry: selectedOptions})}
                                    placeholder="All Funder Countries"
                                    className='border-secondary border-2 rounded-xl'
                                    />
                            </Col>

                            <Col>
                                <MultiSelect
                                    options={selectOptions.Regions}
                                    selectedOptions={filters.FunderRegion}
                                    setSelectedOptions={(selectedOptions) => setFilters({...filters, FunderRegion: selectedOptions})}
                                    placeholder="All Funder Regions"
                                    className='border-secondary border-2 rounded-xl'
                                    />
                            </Col>  
                        </div>
                    </AnimateHeight>
                </div>


                {/* End of standard search */}
                <AnimateHeight
                        delay={advancedSearchShow ? 400 : 0}
                        duration={400}
                        height={!advancedSearchShow ? 0 : 'auto'}
                        className='col-span-2'
                    >  
                    <AdvancedSearch />
                </AnimateHeight>


                    <Col
                        numColSpan={2}
                        className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between md:items-center"
                        >
                        <p className="text-secondary text-lg ">Total Hits: {totalHits}</p>

                        <div className="space-x-4">
                            <Button
                                colour='secondary'
                                onClick={() => setAdvancedSearchShow(!advancedSearchShow)}
                            >
                                {advancedSearchShow ? 'Normal Search' : 'Advanced search'}
                            </Button>
                            <ExportToCsvButton
                                meilisearchRequestBody={exportRequestBody(sharedRequestBody)}
                                filename="search-results-export"
                                title='Download Data'
                                >
                            </ExportToCsvButton>
                        </div>
                    </Col>
            </Grid >
        </div>
    )
}
