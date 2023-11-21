"use client"

import {useMemo, useState} from "react"
import {Col, Text} from "@tremor/react"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import VisualisationCard from "../components/VisualisationCard"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import PathogenDiseaseRelationshipCard from '../components/PathogenDiseaseRelationshipCard'
import FundingAmountsforEachResearchCategoryOverTime from "../components/FundingAmountsforEachResearchCategoryOverTime"
import GrantsByDiseaseCard from "../components/GrantsByDisease/Card"
import WordCloud from "../components/WordCloud"
import JumpMenu from "../components/JumpMenu"
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
            title="Interactive Charts"
            showSummary={true}
            summary="Explore the historical and near real time data on research funding for infectious disease with a pandemic potential using extensive filters and search functionality."
            sidebarContent={
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                />
            }
        >

            <JumpMenu />

            <div className="container relative -z-1 mx-auto my-6 lg:my-12">
                <div
                    className="mt-6 grid grid-cols-1 gap-6 lg:gap-12"
                >
                    <GrantsByDiseaseCard
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <GrantsByResearchCategoryCard
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <GrantsByCountryWhereResearchWasConductedCard
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <FundingAmountsforEachResearchCategoryOverTime
                        selectedFilters={selectedFilters}
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <GrantsPerResearchCategoryByRegion
                        globallyFilteredDataset={globallyFilteredDataset}
                        selectedFilters={selectedFilters}
                    />

                    <PathogenDiseaseRelationshipCard
                        selectedFilters={selectedFilters}
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <RegionalFlowOfGrantsCard
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <VisualisationCard
                        filteredDataset={globallyFilteredDataset}
                        id="disease-word-cloud"
                        title="Word cloud showing the funding for infectious diseases with a pandemic potential"
                    >
                        <div className="w-full">
                            <WordCloud
                                filterKey="Disease"
                                randomSeedString="2324234234"
                            />
                        </div>

                        <div>
                            <Text>
                                The amount of funding is represented by the size of the word
                            </Text>
                        </div>
                    </VisualisationCard>

                    <VisualisationCard
                        filteredDataset={globallyFilteredDataset}
                        id="pathogen-word-cloud"
                        title="Word cloud showing the funding for priority pathogens"
                    >
                        <div className="w-full">
                            <WordCloud
                                filterKey="Pathogen"
                                randomSeedString="2324234234"
                            />
                        </div>

                        <div>
                            <Text>
                                The amount of funding is represented by the size of the word
                            </Text>
                        </div>
                    </VisualisationCard>
                </div>
            </div>
        </Layout>
    )
}
