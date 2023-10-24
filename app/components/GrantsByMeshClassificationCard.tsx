import {Flex, Subtitle, CategoryBar, Legend, Color} from "@tremor/react"
import VisualisationCard from "./VisualisationCard"
import {type CardProps} from "../types/card-props"
import selectOptions from '../../data/dist/select-options.json'
import {useState} from "react"
import Switch from './Switch'

export default function GrantsByMeshClassificationCard({globallyFilteredDataset}: CardProps) {
    const [unspecified, setUnspecified] = useState(true);

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-mesh-classification"
            title="Grants By MESH Classifications"
            subtitle="Doloribus iste inventore odio sint laboriosam eaque. Perspiciatis laborum itaque ea labore ratione. Dolor eveniet itaque dolores doloremque quam alias eaque."
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
        >
            <div className="flex flex-col justify-center gap-y-8 w-full">
                <div className="w-full flex flex-col gap-y-6">
                    <div className="flex flex-col gap-y-6">
                        <DataBar
                            title="Age Groups"
                            dataset={globallyFilteredDataset}
                            fieldName="AgeGroups"
                            showUnspecified={unspecified}
                            options={selectOptions.AgeGroups}
                        />
                    </div>
                </div>

                <Switch
                    checked={unspecified}
                    onChange={setUnspecified}
                    label="Hide Unspecified"
                    className="justify-center"
                />
            </div>
        </VisualisationCard>
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

