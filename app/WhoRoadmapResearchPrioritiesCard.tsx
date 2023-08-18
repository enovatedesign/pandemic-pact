import {useState} from "react"
import {BarList, Card, Title, List, ListItem, Grid, Col, MultiSelect, MultiSelectItem} from "@tremor/react"
import {type StringDictionary} from "../scripts/types/dictionary"

import funders from '../data/source/funders.json'
import lookupTables from '../data/source/lookup-tables.json'

const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

const researchCategories: {value: string, name: string}[] = Object.keys(researchCatLookupTable).map((key: string) => ({
    value: key,
    name: researchCatLookupTable[key],
}))

const numberOfGrantsPerResearchCategory = researchCategories.map(() => ({
    value: Math.floor(Math.random() * 100),
    name: '',
}))

const amountOfMoneySpentPerResearchCategory = researchCategories.map(() => ({
    value: (Math.random() * 100).toFixed(),
    name: '',
}))

const amountOfMoneySpentPerResearchCategoryValueFormatter = (value: number) => {
    return `$${value}M`
}

export default function WhoRoadmapResearchPrioritiesCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([]);

    return (
        <Card>
            <Title>Funded Research Projects by WHO Research Priorities</Title>

            <MultiSelect
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
