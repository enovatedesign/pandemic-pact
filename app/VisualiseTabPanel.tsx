import {TabPanel, Grid, Col, Card} from "@tremor/react"

import GrantsByResearchCategoryCard from './GrantsByResearchCategoryCard'
import AmountSpentOnEachResearchCategoryOverTimeCard from './AmountSpentOnEachResearchCategoryOverTimeCard'

export default function VisualiseTabPanel() {
    return (
        <TabPanel>
            <Grid
                numItems={1}
                className="mt-6 gap-4"
            >
                <Col>
                    <GrantsByResearchCategoryCard />
                </Col>
                <Col>
                    <AmountSpentOnEachResearchCategoryOverTimeCard />
                </Col>
            </Grid>
        </TabPanel>
    )
}
