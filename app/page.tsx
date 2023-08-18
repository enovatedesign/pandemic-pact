import {
    Card,
    Grid,
    Title,
    Text,
    Tab,
    TabList,
    TabGroup,
    TabPanel,
    TabPanels,
} from "@tremor/react";

export default function Home() {
    return (
        <main className="container mx-auto px-12 py-12">
            <Title>Pandemic PACT Tracker</Title>
            <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>

            <TabGroup className="mt-6">
                <TabList>
                    <Tab>Visualise</Tab>
                    <Tab>Explore</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
                            <Card>
                                {/* Placeholder to set height */}
                                <div className="h-28" />
                            </Card>
                            <Card>
                                {/* Placeholder to set height */}
                                <div className="h-28" />
                            </Card>
                            <Card>
                                {/* Placeholder to set height */}
                                <div className="h-28" />
                            </Card>
                        </Grid>
                        <div className="mt-6">
                            <Card>
                                <div className="h-80" />
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="mt-6">
                            <Card>
                                <div className="h-96" />
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </main>
    );
}
