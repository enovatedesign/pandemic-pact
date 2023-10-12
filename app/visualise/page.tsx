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
import {emptyFilters, filterGrants} from "../helpers/filter"
import completeDataset from '../../data/dist/filterable-dataset.json'

export default function Visualise() {
    const [selectedFilters, setSelectedFilters] = useState<Filters>(
        emptyFilters(),
    )

    const globallyFilteredDataset = useMemo(
        () => filterGrants(completeDataset, selectedFilters),
        [selectedFilters],
    )

    return (
        <Layout
            title="Pandemic PACT Tracker"
            summary="Lorem ipsum dolor sit amet, consetetur sadipscing elitr."
            sidebarContent={
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
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
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <GrantsByCountryWhereResearchWasConductedCard
                            selectedFilters={selectedFilters}
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <FundingAmountsforEachResearchCategoryOverTime
                            selectedFilters={selectedFilters}
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <GrantsPerResearchCategoryByRegion
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <GrantsByMeshClassificationCard
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <PathogenDiseaseRelationshipCard
                            selectedFilters={selectedFilters}
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <RegionalFlowOfGrantsCard
                            globallyFilteredDataset={globallyFilteredDataset}
                        />
                    </Col>

                    <Col numColSpan={12}>
                        <Card>
                            <Title>Disease Word Cloud</Title>

                            <WordCloud
                                filterKey="Disease"
                                randomSeedString="2324234234"
                            />
                        </Card>
                    </Col>

                    <Col numColSpan={12}>
                        <Card>
                            <Title>Pathogen Word Cloud</Title>

                            <WordCloud
                                filterKey="Pathogen"
                                randomSeedString="2324234234"
                            />
                        </Card>
                    </Col>
                </Grid>
            </div>
        </Layout>
    )
}
