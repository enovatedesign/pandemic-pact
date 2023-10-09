"use client"

import {useState} from "react"
import {Grid, Col} from "@tremor/react"
import Nav from "../components/Nav"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByMeshClassificationCard from '../components/GrantsByMeshClassificationCard'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import PathogenDiseaseRelationshipCard from '../components/PathogenDiseaseRelationshipCard'
import {type Filters} from "../types/filters"
import FundingAmountsforEachResearchCategoryOverTime from "../components/FundingAmountsforEachResearchCategoryOverTime"

export default function Visualise() {
    const [selectedFilters, setSelectedFilters] = useState<Filters>({
        FundingOrgName: [],
        ResearchInstitutionName: [],
        Disease: [],
        Pathogen: [],
        GrantStartYear: [],
        StudySubject: [],
        AgeGroups: [],
        StudyType: [],
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
                        <PathogenDiseaseRelationshipCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <RegionalFlowOfGrantsCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

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
                        <FundingAmountsforEachResearchCategoryOverTime
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={5}>
                        <GrantsPerResearchCategoryByRegion
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
