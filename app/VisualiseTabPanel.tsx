import {TabPanel, Grid, Card} from "@tremor/react"

import GrantsByResearchCategoryCard from './GrantsByResearchCategoryCard'

export default function VisualiseTabPanel() {
    return (
        <TabPanel>
            <div className="mt-6">
                <GrantsByResearchCategoryCard />
            </div>
        </TabPanel>
    )
}
