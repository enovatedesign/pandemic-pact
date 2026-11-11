import VisualisationCard from "@/app/components/VisualisationCard"
import Map from "@/app/components/GrantsByCountryWhereResearchWasConducted/Map/Map"
import { useState } from "react"
import Switch from "@/app/components/Switch"

const GeographicalDistribution = () => {
    const [showCapacityStrengthening, setShowCapacityStrengthening] = useState<boolean>(false)

    return (
        <VisualisationCard
            id="geographical-distribution"
            title="Geographical Distribution Of Research Awards And Capacity Strengthening Awards"
            subtitle="The information on the research location was collected where available from the award information, and can be different to the location of research institution. Click on a country to see country-specific award information (including co-funded awards)."
            footnote="Please note: Locations of awards indicating capacity strengthening as an objective or involving research on research capacity strengthening also shown."
            filenameToFetch='100-days-mission/100-days-mission-grants.csv'
            filteredFileName='100-days-mission-filtered-grants.csv'
        >
            <Switch
                checked={showCapacityStrengthening}
                onChange={setShowCapacityStrengthening}
                label="Show capacity strengthening awards"
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
