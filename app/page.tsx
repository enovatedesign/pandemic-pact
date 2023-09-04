"use client"

import {useState} from "react"

import {
    Tab,
    TabList,
    TabGroup,
    TabPanels,
} from "@tremor/react"

import VisualiseTabPanel from "./components/VisualiseTabPanel"
import ExploreTabPanel from "./components/ExploreTabPanel"
import Layout from "./components/Layout"
import {FilterSidebar} from "./components/FilterSidebar"

const Home = () => {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
            sidebarContent={
                <FilterSidebar
                    setSelectedFunders={setSelectedFunders}
                />
            }
        >
            <TabGroup className="mt-6">
                <TabList>
                    <Tab>Visualise</Tab>
                    <Tab>Explore</Tab>
                </TabList>

                <TabPanels>
                    <VisualiseTabPanel
                        selectedFunders={selectedFunders}
                    />
                    <ExploreTabPanel />
                </TabPanels>
            </TabGroup>
        </Layout>
    )
}

export default Home
