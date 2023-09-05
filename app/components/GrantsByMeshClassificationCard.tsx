import {Flex, Card, Title, Text, CategoryBar, Legend} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"

import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/grants-by-mesh-classification-card.json'

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const classifications = ['Ethnicity', 'AgeGroups', 'Rurality']

    const databars = classifications.map((classification) => {
        const classificationLookupTable = lookupTables[classification as keyof typeof lookupTables]

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
                .filter((grant: any) => grant[classification as keyof typeof grant] === classificationName)
                .length

            return numberOfGrants
        })

        return {
            classification,
            classificationsNames,
            numberOfGrantsPerClassification,
        }
    })

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
                {selectedFilters.FundingOrgName.length > 0 &&
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
