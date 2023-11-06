import {useEffect, useMemo, useState} from 'react'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import {Text, TextInput, Grid, Col} from '@tremor/react'
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

    return (
        <Grid numItems={2} className="gap-2" >
            <Col numColSpan={2}>
                <TextInput
                    icon={SearchIcon}
                    placeholder="Search..."
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                    value={searchQuery}
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.Disease}
                    selectedOptions={filters.Disease}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, Disease: selectedOptions})}
                    placeholder="All Diseases"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.Pathogen}
                    selectedOptions={filters.Pathogen}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, Pathogen: selectedOptions})}
                    placeholder="All Pathogens"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.ResearchInstitutionCountry}
                    selectedOptions={filters.ResearchInstitutionCountry}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, ResearchInstitutionCountry: selectedOptions})}
                    placeholder="All Research Institution Countries"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.Regions}
                    selectedOptions={filters.ResearchInstitutionRegion}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, ResearchInstitutionRegion: selectedOptions})}
                    placeholder="All Research Institution Regions"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.FunderCountry}
                    selectedOptions={filters.FunderCountry}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, FunderCountry: selectedOptions})}
                    placeholder="All Funder Countries"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.Regions}
                    selectedOptions={filters.FunderRegion}
                    setSelectedOptions={(selectedOptions) => setFilters({...filters, FunderRegion: selectedOptions})}
                    placeholder="All Funder Regions"
                />
            </Col>

            <Col
                numColSpan={2}
                className="flex justify-between items-center"
            >
                <Text>Total Hits: {totalHits}</Text>

                <ExportToCsvButton
                    meilisearchRequestBody={exportRequestBody(sharedRequestBody)}
                    filename="search-results-export"
                >
                    Export Data (CSV)
                </ExportToCsvButton>
            </Col>
        </Grid >
    )
}
