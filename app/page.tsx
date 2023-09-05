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
import {type Filters} from "./types/filters"

const Home = () => {
    const [selectedFilters, setSelectedFilters] = useState<Filters>({
        FundingOrgName: [],
        ResearchCat: [],
        Pathogen: [],
    })

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
            sidebarContent={
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
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
                        selectedFilters={selectedFilters}
                    />
                    <ExploreTabPanel />
                </TabPanels>
            </TabGroup>
        </Layout>
    )
}

export default Home
