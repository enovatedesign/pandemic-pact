import {TabPanel, Grid, Col} from "@tremor/react"

import GrantsByResearchCategoryCard from './GrantsByResearchCategoryCard'
import AmountSpentOnEachResearchCategoryOverTimeCard from './AmountSpentOnEachResearchCategoryOverTimeCard'
import GrantsByRegionCard from './GrantsByRegionCard'
import GrantsByMeshClassificationCard from './GrantsByMeshClassificationCard'
import GrantsByCountryWhereResearchWasConductedCard from './GrantsByCountryWhereResearchWasConductedCard'
import {Filters} from '../types/filters'

interface Props {
    selectedFilters: Filters,
}

export default function VisualiseTabPanel({selectedFilters}: Props) {
    return (
        <TabPanel>
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
                    <AmountSpentOnEachResearchCategoryOverTimeCard
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
        </TabPanel >
    )
}
