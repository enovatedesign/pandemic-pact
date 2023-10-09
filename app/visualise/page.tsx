"use client"

import {useMemo, useState} from "react"
import {Card, Col, Grid, Title} from "@tremor/react"
import Nav from "../components/Nav"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByMeshClassificationCard from '../components/GrantsByMeshClassificationCard'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import PathogenDiseaseRelationshipCard from '../components/PathogenDiseaseRelationshipCard'
import FundingAmountsforEachResearchCategoryOverTime from "../components/FundingAmountsforEachResearchCategoryOverTime"
import WordCloud from "../components/WordCloud"
import {type Filters} from "../types/filters"
import {filterGrants} from "../helpers/filter"
import completeDataset from '../../data/dist/filterable-dataset.json'

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

    const filteredDataset = useMemo(() => {
        const filteredDataset = filterGrants(
            completeDataset,
            selectedFilters,
        )

        return filteredDataset
    }, [selectedFilters])

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
            sidebarContent={
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    filteredDataset={filteredDataset}
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
                            filteredDataset={filteredDataset}
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

                    <Col numColSpan={12}>
                        <GrantsPerResearchCategoryByRegion
                            filteredDataset={filteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <GrantsByMeshClassificationCard
                            filteredDataset={filteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <PathogenDiseaseRelationshipCard
                            selectedFilters={selectedFilters}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <RegionalFlowOfGrantsCard
                            filteredDataset={filteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <Card>
                            <Title>Disease Word Cloud</Title>
                            <WordCloud filterKey="Disease" randomSeedString="2324234234" />
                        </Card>
                    </Col>

                    <Col numColSpan={12}>
                        <Card>
                            <Title>Pathogen Word Cloud</Title>
                            <WordCloud filterKey="Pathogen" randomSeedString="2324234234" />
                        </Card>
                    </Col>
                </Grid>
            </div>
        </Layout>
    )
}
