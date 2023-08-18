import {TabPanel, Grid, Col, Card, TextInput} from "@tremor/react"
import {SearchIcon} from "@heroicons/react/solid"

export default function ExploreTabPanel() {
    return (
        <TabPanel key="explore-tab-panel">
            <div className="mt-6">
                <Grid className="gap-y-2">
                    <Col>
                        <TextInput
                            icon={SearchIcon}
                            placeholder="Search..."
                        />
                    </Col>
                </Grid>
            </div>
        </TabPanel>
    )
}
