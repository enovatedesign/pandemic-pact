"use client"

import {
    Tab,
    TabList,
    TabGroup,
    TabPanels,
} from "@tremor/react"

import VisualiseTabPanel from "./VisualiseTabPanel"
import ExploreTabPanel from "./ExploreTabPanel"

export default function Home() {
    return (
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
    )
}
