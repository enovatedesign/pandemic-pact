"use client"

import {useState} from "react"
import Nav from "./components/Nav"
import VisualiseTabPanel from "./components/VisualiseTabPanel"
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
            <div className="mt-6">
                <Nav selected="visualise" />

                <VisualiseTabPanel
                    selectedFilters={selectedFilters}
                />
            </div>
        </Layout>
    )
}

export default Home
