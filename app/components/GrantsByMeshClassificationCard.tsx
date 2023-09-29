import {Flex, Card, Title, Subtitle, Text, CategoryBar, Legend, Color} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

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
                    options={selectOptions.Ethnicity}
                />

                <DataBar
                    title="Age Groups"
                    dataset={filteredDataset}
                    fieldName="AgeGroups"
                    options={selectOptions.AgeGroups}
                />

                <DataBar
                    title="Rurality"
                    dataset={filteredDataset}
                    fieldName="Rurality"
                    options={selectOptions.Rurality}
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
    const colours: Color[] = [
        'blue',
        'lime',
        'cyan',
        'violet',
        'orange',
        'emerald',
        'indigo',
        'purple',
        'amber',
        'green',
        'red',
        'fuchsia',
        'yellow',
        'neutral',
    ];

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

    const sum = numberOfGrantsPerOption.reduce((a, b) => a + b, 0)

    const numberOfGrantsPerOptionPercentage = numberOfGrantsPerOption.map(
        (value: number) => Math.round((value / sum) * 100)
    )

    return (
        <div>
            <Subtitle>{title} (%)</Subtitle>

            <Legend
                categories={optionValues}
                className="mt-4"
                colors={colours}
            />

            <CategoryBar
                values={numberOfGrantsPerOptionPercentage}
                className="mt-4"
                colors={colours}
            />
        </div >
    )
}

