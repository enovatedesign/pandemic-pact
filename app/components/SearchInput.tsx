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

export default function SearchInput({setSearchResponse}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchQueryFromUrl = searchParams.get('q') ?? ''

    const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl)
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])
    const [totalHits, setTotalHits] = useState<number>(0)

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        if (searchQuery) {
            url.searchParams.set('q', searchQuery)
        } else {
            url.searchParams.delete('q')
        }

        router.replace(url.href, {shallow: true})
    }, [
        searchQuery,
        pathname,
        router,
    ])

    const sharedRequestBody = useMemo(() => {
        let body: MeilisearchRequestBody = {
            q: searchQuery,
        }

        const filter = []

        if (selectedDiseases.length > 0) {
            filter.push(
                selectedDiseases.length === 1 ?
                    `Disease = "${selectedDiseases[0]}"` :
                    selectedDiseases.map(disease => `Disease = "${disease}"`)
            )
        }

        if (selectedPathogens.length > 0) {
            filter.push(
                selectedPathogens.length === 1 ?
                    `Pathogen = "${selectedPathogens[0]}"` :
                    selectedPathogens.map(pathogen => `Pathogen = "${pathogen}"`)
            )
        }

        if (filter.length > 0) {
            body.filter = filter
        }

        return body
    }, [
        searchQuery,
        selectedDiseases,
        selectedPathogens,
    ])

    useEffect(() => {
        const searchRequestBody = highlightedResultsRequestBody({
            ...sharedRequestBody,
            showRankingScore: true,
        })

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
                    selectedOptions={selectedDiseases}
                    setSelectedOptions={setSelectedDiseases}
                    placeholder="All Diseases"
                />
            </Col>

            <Col>
                <MultiSelect
                    options={selectOptions.Pathogen}
                    selectedOptions={selectedPathogens}
                    setSelectedOptions={setSelectedPathogens}
                    placeholder="All Pathogens"
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
