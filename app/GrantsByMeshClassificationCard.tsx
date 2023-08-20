import {useState} from "react"
import {Flex, Button, Card, Title, MultiSelect, MultiSelectItem, Text, CategoryBar, Legend} from "@tremor/react"
import {DownloadIcon} from "@heroicons/react/solid"
import {type StringDictionary} from "../scripts/types/dictionary"
import meilisearchRequest from './helpers/meilisearch-request'
import exportToXlsx from "./helpers/export-to-xlsx"

import funders from '../data/source/funders.json'
import lookupTables from '../data/source/lookup-tables.json'
import dataset from '../data/dist/grants-by-mesh-classification-card.json'

export default function GrantsByResearchCategoryCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])
    const [exportingResults, setExportingResults] = useState<boolean>(false)

    const filteredDataset = selectedFunders.length > 0
        ? dataset.filter(grant => selectedFunders.includes(grant.FundingOrgName))
        : dataset

    const classifications = ['Ethnicity', 'AgeGroups', 'Rurality']

    const databars = classifications.map((classification: string) => {
        const classificationLookupTable = lookupTables[classification] as StringDictionary

        const classificationsNames: string[] = Object.values(classificationLookupTable)
            .filter(
                (classificationName: string) => ![
                    'Unspecified',
                    'Other',
                    'Not known',
                    'Not applicable',
                ].includes(classificationName)
            )

        const numberOfGrantsPerClassification = classificationsNames.map(function (classificationName) {
            const numberOfGrants = filteredDataset
                .filter(grant => grant[classification] === classificationName)
                .length

            return numberOfGrants
        })

        return {
            classification,
            classificationsNames,
            numberOfGrantsPerClassification,
        }
    })

    const exportResults = () => {
        setExportingResults(true)

        const body = {
            filter: `GrantID IN [${filteredDataset.map(grant => grant.GrantID).join(',')}]`,
            sort: ['GrantID:asc'],
            limit: 100_000, // TODO determine this based on number of generated grants in complete dataset?
        }

        meilisearchRequest('exports', body).then(data => {
            exportToXlsx('pandemic-pact-grants-by-region-export.xlsx', data.hits)
            setExportingResults(false)
        }).catch((error) => {
            console.error('Error:', error)
            setExportingResults(false)
        })
    }

    return (
        <Card className="flex flex-col gap-y-6">
            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <Title>Grants By MESH Classifications</Title>
                <Text>Total Grants: {dataset.length}</Text>
            </Flex>

            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <MultiSelect
                    value={selectedFunders}
                    onValueChange={setSelectedFunders}
                    placeholder="Select funders..."
                    className="max-w-xs"
                >
                    {funders.map((funderName) => (
                        <MultiSelectItem key={funderName} value={funderName}>
                            {funderName}
                        </MultiSelectItem>
                    ))}
                </MultiSelect>

                {selectedFunders.length > 0 &&
                    <Text>Filtered Grants: {filteredDataset.length}</Text>
                }
            </Flex>

            <div className="flex flex-col gap-y-6">
                {databars.map((databar, index) =>
                    <div key={index}>
                        <Flex
                            justifyContent="between"
                            alignItems="center"
                        >
                            <Text>{databar.classification}</Text>

                            <Legend
                                categories={databar.classificationsNames}
                            />
                        </Flex>

                        <CategoryBar
                            values={databar.numberOfGrantsPerClassification}
                            className="mt-3"
                        />
                    </div>
                )}
            </div>

            <Flex
                justifyContent="end"
            >
                <Button
                    icon={DownloadIcon}
                    loading={exportingResults}
                    disabled={exportingResults}
                    onClick={exportResults}
                >
                    Export Results To XLSX
                </Button>
            </Flex>
        </Card>
    )
}
