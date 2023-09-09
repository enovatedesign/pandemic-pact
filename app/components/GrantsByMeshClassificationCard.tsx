import {Flex, Card, Title, Subtitle, Text, CategoryBar, Legend} from "@tremor/react"
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

            {filteredDataset.length < dataset.length &&
                <Flex
                    alignItems="center"
                    className="ignore-in-image-export"
                >
                    <Text>Filtered Grants: {filteredDataset.length}</Text>
                </Flex>
            }

            <div className="flex flex-col gap-y-6">
                <DataBar
                    title="Ethnicity"
                    dataset={filteredDataset}
                    fieldName="Ethnicity"
                    options={ethnicityOptions}
                />

                <DataBar
                    title="Age Groups"
                    dataset={filteredDataset}
                    fieldName="AgeGroups"
                    options={ageGroupOptions}
                />

                <DataBar
                    title="Rurality"
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
    title: string
    fieldName: string
    dataset: any[]
    options: any[]
}

function DataBar({title, fieldName, dataset, options}: DataBarProps) {
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
            <Subtitle>{title}</Subtitle>

            <Legend
                categories={optionValues}
                className="mt-4"
            />

            <CategoryBar
                values={numberOfGrantsPerOption}
                className="mt-4"
            />
        </div >
    )
}

