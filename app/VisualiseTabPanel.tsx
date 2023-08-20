import {TabPanel, Grid, Col} from "@tremor/react"

import GrantsByResearchCategoryCard from './GrantsByResearchCategoryCard'
import AmountSpentOnEachResearchCategoryOverTimeCard from './AmountSpentOnEachResearchCategoryOverTimeCard'
import GrantsByRegionCard from './GrantsByRegionCard'
import GrantsByMeshClassificationCard from './GrantsByMeshClassificationCard'
export default function VisualiseTabPanel() {
    return (
        <TabPanel>
            <Grid
                numItems={2}
                className="mt-6 gap-4"
            >
                <Col numColSpan={2}>
                    <GrantsByResearchCategoryCard />
                </Col>
                <Col numColSpan={2}>
                    <AmountSpentOnEachResearchCategoryOverTimeCard />
                </Col>
                <Col numColSpan={1}>
                    <GrantsByRegionCard />
                </Col>
                <Col numColSpan={1}>
                    <GrantsByMeshClassificationCard />
                </Col>
            </Grid>
        </TabPanel >
    )
}
