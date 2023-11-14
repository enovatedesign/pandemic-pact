"use client"

import {useMemo, useState} from "react"
import {Col, Grid} from "@tremor/react"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import VisualisationCard from "../components/VisualisationCard"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import PathogenDiseaseRelationshipCard from '../components/PathogenDiseaseRelationshipCard'
import FundingAmountsforEachResearchCategoryOverTime from "../components/FundingAmountsforEachResearchCategoryOverTime"
import GrantsByDiseaseCard from "../components/GrantsByDisease"
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
            title="Visualise"
            showSummary={true}
            summary="View our visualisations and discover insights within our data."
            sidebarContent={
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                />
            }
        >
            <div className="container mx-auto my-6 lg:my-12">
                <div
                    className="grid grid-cols-1 mt-6 gap-6 lg:gap-12"
                >
                    <GrantsByResearchCategoryCard
                        globallyFilteredDataset={globallyFilteredDataset}
                    />

                    <GrantsByDiseaseCard
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
                        title="Disease Word Cloud"
                    >
                        <div className="w-full">
                            <WordCloud
                                filterKey="Disease"
                                randomSeedString="2324234234"
                            />
                        </div>
                    
                    </VisualisationCard>

                    <VisualisationCard
                        filteredDataset={globallyFilteredDataset}
                        id="pathogen-word-cloud"
                        title="Pathogen Word Cloud"
                    >
                        <div className="w-full">
                            <WordCloud
                                filterKey="Pathogen"
                                randomSeedString="2324234234"
                            />
                        </div>
                    </VisualisationCard>
                </div>
            </div>
        </Layout>
    )
}
