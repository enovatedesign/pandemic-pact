import {BarList, Card, Title, List, ListItem, Grid, Col} from "@tremor/react"

const whoResearchPriorities = [
    {
        value: '1',
        name: "Virus: natural history, transmission and diagnostics",
    },
    {
        value: '2',
        name: "Animal and environmental research",
    },
    {
        value: '3',
        name: "Epidemiological studies",
    },
    {
        value: '4',
        name: "Clinical characterization and management",
    },
    {
        value: '5',
        name: "Infection prevention and control",
    },
    {
        value: '6',
        name: "Candidate therapeutics R&D",
    },
    {
        value: '7',
        name: "Candidate vaccines R&D",
    },
    {
        value: '8',
        name: "Ethics considerations for research",
    },
    {
        value: '9',
        name: "Social sciences in the outbreak response",
    },
    {
        value: '',
        name: "N/A",
    },
]

const numberOfGrantsPerWhoResearchPriority = [
    {
        value: 456,
        name: '',
    },
    {
        value: 351,
        name: '',
    },
    {
        value: 271,
        name: '',
    },
    {
        value: 191,
        name: '',
    },
    {
        value: 91,
        name: '',
    },
    {
        value: 456,
        name: '',
    },
    {
        value: 351,
        name: '',
    },
    {
        value: 271,
        name: '',
    },
    {
        value: 191,
        name: '',
    },
    {
        value: 91,
        name: '',
    },
]

const amountOfMoneySpentPerWhoResearchPriority = [
    {
        value: 456,
        name: '',
    },
    {
        value: 351,
        name: '',
    },
    {
        value: 271,
        name: '',
    },
    {
        value: 191,
        name: '',
    },
    {
        value: 91,
        name: '',
    },
    {
        value: 456,
        name: '',
    },
    {
        value: 351,
        name: '',
    },
    {
        value: 271,
        name: '',
    },
    {
        value: 191,
        name: '',
    },
    {
        value: 91,
        name: '',
    },
]

const amountOfMoneySpentPerWhoResearchPriorityValueFormatter = (value: number) => {
    return `$${value}M`
}

export default function WhoRoadmapResearchPrioritiesCard() {
    return (
        <Card>
            <Title>Funded Research Projects by WHO Research Priorities</Title>

            <Grid className="mt-6 gap-12" numItems={3}>
                <Col>
                    <List>
                        {whoResearchPriorities.map((item) => (
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
                    <BarList data={numberOfGrantsPerWhoResearchPriority} />
                </Col>

                <Col>
                    <BarList
                        data={amountOfMoneySpentPerWhoResearchPriority}
                        valueFormatter={amountOfMoneySpentPerWhoResearchPriorityValueFormatter}
                    />
                </Col>
            </Grid>
        </Card>
    )
}
