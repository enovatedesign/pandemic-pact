import {useEffect, useState} from 'react'
import {TextInput, Grid, Col, MultiSelect, MultiSelectItem} from '@tremor/react'
import {SearchIcon} from "@heroicons/react/solid"
import {type SearchResults} from './types/search-results'
import {type StringDictionary} from '../scripts/types/dictionary'
import lookupTables from '../data/source/lookup-tables.json'

export default function SearchInput({setSearchResults}: {setSearchResults: (searchResults: SearchResults) => void}) {
    if (!process.env.NEXT_PUBLIC_MEILISEARCH_HOST) {
        return null
    }

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

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])

    useEffect(() => {
        let headers: {[key: string]: string} = {
            'Content-Type': 'application/json'
        }

        const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
        const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`
        }

        const body: {q: string, filter?: Array<string | string[]>} = {q: searchQuery}

        const filter = [];

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
            body['filter'] = filter;
        }

        fetch(`${host}/indexes/grants/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        })
            .then(response => response.json())
            .then(data => {
                setSearchResults(data.hits)
            }).catch((error) => {
                console.error('Error:', error)
            })
    }, [searchQuery, selectedDiseases, selectedPathogens])

    return (
        <Grid numItems={2} className="gap-2">
            <Col numColSpan={2}>
                <TextInput
                    icon={SearchIcon}
                    placeholder="Search..."
                    onInput={event => setSearchQuery(event.target.value)}
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
        </Grid>
    )
}
