import {useEffect, useState} from 'react'
import {Button, Text, TextInput, Grid, Col, MultiSelect, MultiSelectItem} from '@tremor/react'
import {DownloadIcon, SearchIcon} from "@heroicons/react/solid"
import {type SearchResults} from './types/search-results'
import {type StringDictionary} from '../scripts/types/dictionary'
import lookupTables from '../data/source/lookup-tables.json'

export default function SearchInput({setSearchResults}: {setSearchResults: (searchResults: SearchResults) => void}) {
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])
    const [totalHits, setTotalHits] = useState<number>(0)
    const [exportingResults, setExportingResults] = useState<boolean>(false)

    const meilisearchFetch = async (index: string, additionalOptions: {limit?: number, hitsPerPage?: number, sort?: string[]} = {}) => {
        let headers: {[key: string]: string} = {
            'Content-Type': 'application/json'
        }

        const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
        const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`
        }

        const body: {q: string, filter?: Array<string | string[]>} = Object.assign(
            {q: searchQuery},
            additionalOptions,
        )

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
            body['filter'] = filter
        }

        return fetch(`${host}/indexes/${index}/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }).then(response => response.json())
    }

    const performFullTextSearch = () => {
        if (!process.env.NEXT_PUBLIC_MEILISEARCH_HOST) {
            console.warn('NEXT_PUBLIC_MEILISEARCH_HOST is not set, not attempting search')
            return
        }

        meilisearchFetch('grants').then(data => {
            setSearchResults(data.hits)
            setTotalHits(data.estimatedTotalHits)
        }).catch((error) => {
            console.error('Error:', error)
        })
    }

    const exportResults = () => {
        if (!process.env.NEXT_PUBLIC_MEILISEARCH_HOST) {
            console.warn('NEXT_PUBLIC_MEILISEARCH_HOST is not set, not attempting export')
            return
        }

        setExportingResults(true)

        const limit = 100_000 // TODO determine this based on number of generated grants in complete dataset?

        meilisearchFetch('exports', {limit, hitsPerPage: limit, sort: ['GrantID:asc']}).then(data => {
            setExportingResults(false)
            console.log(data);
        }).catch((error) => {
            console.error('Error:', error)
            setExportingResults(false)
        })
    }

    useEffect(performFullTextSearch, [searchQuery, selectedDiseases, selectedPathogens, setTotalHits, setSearchResults])

    const diseasesLookupTable = lookupTables.Diseases as StringDictionary

    const diseases: {value: string, name: string}[] = Object.keys(diseasesLookupTable).map((key: string) => ({
        value: key,
        name: diseasesLookupTable[key],
    }))

    const pathogensLookupTable = lookupTables.Pathogens as StringDictionary

    const pathogens: {value: string, name: string}[] = Object.keys(pathogensLookupTable).map((key: string) => ({
        value: key,
        name: pathogensLookupTable[key],
    }))

    return (
        <Grid numItems={2} className="gap-2">
            <Col numColSpan={2}>
                <TextInput
                    icon={SearchIcon}
                    placeholder="Search..."
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                />
            </Col>

            <Col>
                <MultiSelect
                    value={selectedDiseases}
                    onValueChange={setSelectedDiseases}
                    placeholder="Select diseases..."
                >
                    {diseases.map(disease => (
                        <MultiSelectItem key={`disease-${disease.value}`} value={disease.name}>
                            {disease.name}
                        </MultiSelectItem>
                    ))}
                </MultiSelect>
            </Col>

            <Col>
                <MultiSelect
                    value={selectedPathogens}
                    onValueChange={setSelectedPathogens}
                    placeholder="Select pathogens..."
                >
                    {pathogens.map(pathogen => (
                        <MultiSelectItem key={`pathogen-${pathogen.value}`} value={pathogen.name}>
                            {pathogen.name}
                        </MultiSelectItem>
                    ))}
                </MultiSelect>
            </Col>

            <Col
                numColSpan={2}
                className="flex justify-between items-center"
            >
                <Text>Total Hits: {totalHits}</Text>

                <Button
                    icon={DownloadIcon}
                    loading={exportingResults}
                    disabled={exportingResults || totalHits === 0}
                    onClick={exportResults}
                >
                    Export Results To XLSX
                </Button>
            </Col>
        </Grid>
    )
}
