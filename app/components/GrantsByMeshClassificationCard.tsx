import {Flex, Card, Title, Subtitle, Text, CategoryBar, Legend, Color, Button} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'
import {EyeIcon} from "@heroicons/react/solid"
import {useState} from "react"

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)
    const [unspecified, setUnspecified] = useState(false);

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
                    title="Age Groups"
                    dataset={filteredDataset}
                    fieldName="AgeGroups"
                    showUnspecified={unspecified}
                    options={selectOptions.AgeGroups}
                />
            </div>

            <Flex
            >
                <Flex
                    alignItems="center"
                    justifyContent="start"
                >
                    <Button
                        icon={EyeIcon}
                        onClick={() => {
                            setUnspecified(!unspecified);
                        }}
                    >
                        {unspecified === true ? 'Show Unspecified' : 'Hide Unspecified'}
                    </Button >
                </Flex>

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
            </Flex>
        </Card>
    )
}

interface DataBarProps {
    title: string
    fieldName: string
    showUnspecified: boolean
    dataset: any[]
    options: any[]
}

function DataBar({title, fieldName, showUnspecified, dataset, options}: DataBarProps) {
    const colours: Color[] = [
        'blue',
        'orange',
        'purple',
        'amber',
        'green',
        'red',
        'pink',
        'yellow',
        'violet',
        'neutral',
    ];

    var filterOut = [
        'Other',
        'Not known',
    ];

    if (showUnspecified) {
        filterOut = filterOut.concat([
            'Unspecified',
            'Not applicable',
        ]);
    }

    const optionValues: string[] = options.map(
        (option: any) => option.label
    ).filter(
        (name: string) => !filterOut.includes(name)
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

