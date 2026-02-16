import VisualisationCard from "@/app/components/VisualisationCard"
import Map from "@/app/components/GrantsByCountryWhereResearchWasConducted/Map/Map"
import { useState } from "react"
import Switch from "@/app/components/Switch"

const GeographicalDistribution = () => {
    const [showCapacityStrengthening, setShowCapacityStrengthening] = useState<boolean>(false)

    return (
        <VisualisationCard
            id="geographical-distribution-of-clinical-research-grants-and-capacity-strengthening-grants"
            title="Geographical Distribution Of Research Grants And Capacity Strengthening Grants"
            subtitle="The information on the research location was collected where available from the grant application, and can be different to the location of research institution. Click on a country to see country-specific grant information (including co-funded grants)."
            footnote="Please note: Locations of grants indicating capacity strengthening as an objective or involving research on research capacity strengthening also shown."
            filenameToFetch='100-days-mission/100-days-mission-grants.csv'
            filteredFileName='100-days-mission-filtered-grants.csv'
        >
            <Switch
                checked={showCapacityStrengthening}
                onChange={setShowCapacityStrengthening}
                label="Show capacity strengthening grants"
                theme="light"
            />

            <Map
                showColourScaleOnly={true}
                highlightJointFundedOnClick={true}
                showJointFundedByDefault={true}
                showCapacityStrengthening={showCapacityStrengthening}
            />
        </VisualisationCard>
    )
}

export default GeographicalDistribution
