import {Flex, Card, Title, Subtitle, Text, CategoryBar, Legend, Color, Button} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'
import {useState} from "react"
import {Switch} from "@headlessui/react"

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)
    const [unspecified, setUnspecified] = useState(true);

    return (
        <Card
            className="flex flex-col gap-y-6"
            id="grants-by-mesh-classification-card"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-2"
            >
                <Title>Grants By MESH Classifications</Title>

                <Subtitle>
                    Doloribus iste inventore odio sint laboriosam eaque.
                    Perspiciatis laborum itaque ea labore ratione.
                    Dolor eveniet itaque dolores doloremque quam alias eaque.
                </Subtitle>
            </Flex>

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

                    <div className="flex items-center gap-x-2">
                        <Switch
                            checked={unspecified}
                            onChange={setUnspecified}
                            className="relative inline-flex items-center h-6 bg-blue-600 rounded-full w-11"
                        >
                            <span className="sr-only">Display Unspecified</span>

                            <span
                                className={`${unspecified ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                        </Switch>

                        <Text className={opaqueTextIf(!unspecified)}>Hide Unspecified</Text>
                    </div>
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

function opaqueTextIf(condition: boolean) {
    return condition ? 'opacity-100 text-black' : 'opacity-75'
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

