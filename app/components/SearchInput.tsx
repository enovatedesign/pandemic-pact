import {useEffect, useMemo, useState} from 'react'
import {Text, TextInput, Grid, Col, MultiSelect, MultiSelectItem} from '@tremor/react'
import {SearchIcon} from "@heroicons/react/solid"
import ExportToCsvButton from "./ExportToCsvButton"
import {type SearchResults} from '../types/search-results'
import {type StringDictionary} from '../../scripts/types/dictionary'
import lookupTables from '../../data/source/lookup-tables.json'
import {meilisearchRequest, exportRequestBody, type MeilisearchRequestBody} from '../helpers/meilisearch'

export default function SearchInput({setSearchResults}: {setSearchResults: (searchResults: SearchResults) => void}) {
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])
    const [totalHits, setTotalHits] = useState<number>(0)

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
        const searchRequestBody = Object.assign(
            {},
            sharedRequestBody,
            {
                attributesToHighlight: ['GrantTitleEng'],
                highlightPreTag: "<strong>",
                highlightPostTag: "</strong>",
            }
        )

        meilisearchRequest('grants', searchRequestBody).then(data => {
            setSearchResults(data.hits)
            setTotalHits(data.estimatedTotalHits)
        }).catch((error) => {
            console.error('Error:', error)
        })
    }, [
        sharedRequestBody,
        setTotalHits,
        setSearchResults,
    ])

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
        <Grid numItems={2} className="gap-2" >
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

                <ExportToCsvButton
                    meilisearchRequestBody={exportRequestBody(sharedRequestBody)}
                    filename="search-results-export"
                />
            </Col>
        </Grid >
    )
}