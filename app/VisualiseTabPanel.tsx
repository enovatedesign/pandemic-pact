import {TabPanel, Grid, Card} from "@tremor/react"

import WhoRoadmapResearchPrioritiesCard from './WhoRoadmapResearchPrioritiesCard'

export default function VisualiseTabPanel() {
    return (
        <TabPanel>
            <div className="mt-6">
                <WhoRoadmapResearchPrioritiesCard />
            </div>
        </TabPanel>
    )
}
