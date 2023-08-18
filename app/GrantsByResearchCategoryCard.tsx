import {useState} from "react"
import {BarList, Card, Title, List, ListItem, Grid, Col, MultiSelect, MultiSelectItem} from "@tremor/react"
import {type StringDictionary} from "../scripts/types/dictionary"
import {millify} from "millify"

import funders from '../data/source/funders.json'
import lookupTables from '../data/source/lookup-tables.json'
import completeDataset from '../data/dist/complete-dataset.json'

export default function WhoRoadmapResearchPrioritiesCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])

    const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

    const researchCategories: {value: string, name: string}[] = Object.keys(researchCatLookupTable).map((key: string) => ({
        value: key,
        name: researchCatLookupTable[key],
    }))

    const dataset = selectedFunders.length > 0
        ? completeDataset.filter(grant => selectedFunders.includes(grant.FundingOrgName))
        : completeDataset

    const numberOfGrantsPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = dataset
            .filter(grant => grant.ResearchCat === researchCategory.name)
            .length

        return {
            key: `grants-per-category-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneySpentPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = dataset
            .filter(grant => grant.ResearchCat === researchCategory.name)
            .reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)

        return {
            key: `grant-amount-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneySpentPerResearchCategoryValueFormatter = (value: number) => {
        return '$' + millify(value, {precision: 2})
    }

    return (
        <Card>
            <Title>Grants By Research Category</Title>

            <MultiSelect
                value={selectedFunders}
                onValueChange={setSelectedFunders}
                placeholder="Select funders..."
                className="max-w-xs mt-6"
            >
                {funders.map((funderName) => (
                    <MultiSelectItem key={funderName} value={funderName}>
                        {funderName}
                    </MultiSelectItem>
                ))}
            </MultiSelect>

            <Grid className="mt-6 gap-12" numItems={3}>
                <Col>
                    <List>
                        {researchCategories.map((item) => (
                            <ListItem
                                key={item.value}
                                className="h-9 mb-2 border-none justify-start"
                            >
                                <span className="min-w-[2rem]">{item.value}</span>
                                <span className="truncate">{item.name}</span>
                            </ListItem>
                        ))}
                    </List>
                </Col>

                <Col>
                    <BarList data={numberOfGrantsPerResearchCategory} />
                </Col>

                <Col>
                    <BarList
                        data={amountOfMoneySpentPerResearchCategory}
                        valueFormatter={amountOfMoneySpentPerResearchCategoryValueFormatter}
                    />
                </Col>
            </Grid>
        </Card>
    )
}
