import {Flex, Card, Title, Text, CategoryBar, Legend} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"

import ethnicityOptions from '../../data/dist/select-options/Ethnicity.json'
import ageGroupOptions from '../../data/dist/select-options/AgeGroups.json'
import ruralityOptions from '../../data/dist/select-options/Rurality.json'
import dataset from '../../data/dist/grants-by-mesh-classification-card.json'

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    return (
        <Card
            className="flex flex-col gap-y-6"
            id="grants-by-mesh-classification-card"
        >
            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <Title>Grants By MESH Classifications</Title>
                <Text>Total Grants: {dataset.length}</Text>
            </Flex>

            <Flex
                alignItems="center"
                className="ignore-in-image-export"
            >
                {filteredDataset.length < dataset.length &&
                    <Text>Filtered Grants: {filteredDataset.length}</Text>
                }
            </Flex>

            <div className="flex flex-col gap-y-6">
                <DataBar
                    dataset={filteredDataset}
                    fieldName="Ethnicity"
                    options={ethnicityOptions}
                />

                <DataBar
                    dataset={filteredDataset}
                    fieldName="AgeGroups"
                    options={ageGroupOptions}
                />

                <DataBar
                    dataset={filteredDataset}
                    fieldName="Rurality"
                    options={ruralityOptions}
                />
            </div>

            <Flex
                justifyContent="end"
                alignItems="center"
                className="gap-x-2 ignore-in-image-export"
            >
                <ExportToPngButton
                    selector="#grants-by-mesh-classification-card"
                    filename="grant-by-mesh-classification-card"
                />

                <ExportToCsvButton
                    meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                    filename="grant-by-mesh-classification"
                />
            </Flex>
        </Card>
    )
}

interface DataBarProps {
    dataset: any[]
    fieldName: string
    options: any[]
}

function DataBar({dataset, fieldName, options}: DataBarProps) {
    const optionValues: string[] = options.map(
        (option: any) => option.label
    ).filter(
        (name: string) => ![
            'Unspecified',
            'Other',
            'Not known',
            'Not applicable',
        ].includes(name)
    )

    const numberOfGrantsPerOption = optionValues.map(
        name => dataset.filter(
            (grant: any) => grant[fieldName] === name
        ).length
    )

    return (
        <div>
            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <Text>{fieldName}</Text>

                <Legend
                    categories={optionValues}
                />
            </Flex>

            <CategoryBar
                values={numberOfGrantsPerOption}
                className="mt-3"
            />
        </div >
    )
}

