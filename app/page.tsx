"use client"

import {
    Tab,
    TabList,
    TabGroup,
    TabPanels,
} from "@tremor/react"

import VisualiseTabPanel from "./components/VisualiseTabPanel"
import ExploreTabPanel from "./components/ExploreTabPanel"
import Layout from "./components/Layout"

const SidebarContent = () => <></>

const Home = () => (
    <Layout sidebarContent={<SidebarContent/>}>
        <TabGroup className="mt-6">
            <TabList>
                <Tab>Visualise</Tab>
                <Tab>Explore</Tab>
            </TabList>

            <TabPanels>
                <VisualiseTabPanel />
                <ExploreTabPanel />
            </TabPanels>
        </TabGroup>
    </Layout>
)

export default Home
