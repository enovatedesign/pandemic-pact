import {TabPanel, Grid, Col} from "@tremor/react"

import GrantsByResearchCategoryCard from './GrantsByResearchCategoryCard'
import AmountSpentOnEachResearchCategoryOverTimeCard from './AmountSpentOnEachResearchCategoryOverTimeCard'
import GrantsByRegionCard from './GrantsByRegionCard'
import GrantsByMeshClassificationCard from './GrantsByMeshClassificationCard'
import GrantsByCountryWhereResearchWasConductedCard from './GrantsByCountryWhereResearchWasConductedCard'

export default function VisualiseTabPanel() {
    return (
        <TabPanel>
            <Grid
                numItems={12}
                className="mt-6 gap-4"
            >
                <Col numColSpan={12}>
                    <GrantsByCountryWhereResearchWasConductedCard />
                </Col>

                <Col numColSpan={12}>
                    <GrantsByResearchCategoryCard />
                </Col>
                <Col numColSpan={12}>
                    <AmountSpentOnEachResearchCategoryOverTimeCard />
                </Col>
                <Col numColSpan={5}>
                    <GrantsByRegionCard />
                </Col>
                <Col numColSpan={7}>
                    <GrantsByMeshClassificationCard />
                </Col>
            </Grid>
        </TabPanel >
    )
}
