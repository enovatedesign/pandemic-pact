"use client"

import {useState} from "react"
import {Grid, Col} from "@tremor/react"
import Nav from "../components/Nav"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategoryCard'
import AmountCommittedToEachResearchCategoryOverTimeCard from '../components/AmountCommittedToEachResearchCategoryOverTimeCard'
import GrantsByRegionCard from '../components/GrantsByRegionCard'
import GrantsByMeshClassificationCard from '../components/GrantsByMeshClassificationCard'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConductedCard'
import {type Filters} from "../types/filters"

export default function Visualise() {
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

                <Grid
                    numItems={12}
                    className="mt-6 gap-4"
                >
                    <Col numColSpan={12}>
                        <GrantsByResearchCategoryCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <GrantsByCountryWhereResearchWasConductedCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <AmountCommittedToEachResearchCategoryOverTimeCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={5}>
                        <GrantsByRegionCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={7}>
                        <GrantsByMeshClassificationCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>
                </Grid>
            </div>
        </Layout>
    )
}