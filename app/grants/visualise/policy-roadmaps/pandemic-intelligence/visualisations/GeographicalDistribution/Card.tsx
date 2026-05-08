import VisualisationCard from '@/app/components/VisualisationCard'
import Map from "@/app/components/GrantsByCountryWhereResearchWasConducted/Map/Map"
import { ChartBarIcon, GlobeIcon } from '@heroicons/react/outline'
import BarChart from "@/app/components/GrantsByCountryWhereResearchWasConducted/BarChart"

const Card = () => {
    const tabs = [
        {
            tab: {
                icon: GlobeIcon,
                label: 'Map',
            },
            content: <Map
                showColourScaleOnly={true}
                highlightJointFundedOnClick={false}
                showJointFundedByDefault={false}
                showCapacityStrengthening={false}
            />
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: 'Bars',
            },
            content: <BarChart 
                countryField='FunderCountry'
                regionField='ResearchLocationRegion'
            />,
        }
    ]
    
  return (
    <VisualisationCard 
        id="geographical-distribution"
        title="Global Map Of Geographical Distribution Of Funding Organisations OR Research Locations"
        subtitle="The information on the research location was collected where available from the grant application, and can be different to the location of research institution. Click on a country to see country-specific grant information (including joint-funded grants)."
        footnote="Please note: Funding amounts are included only when they have been published by the funder. Some research projects are undertaken in multiple locations (countries). Some are funded by multiple funders, the breakdown of joint-funded projects can be found when selecting a country and 'show joint-funded countries'. Where research location is not explicitly specified the default used is the location of the research institution receiving the funds."
        tabs={tabs}
        filenameToFetch='pandemic-intelligence/pandemic-intelligence-grants.csv'
        filteredFileName='pandemic-intelligence-filtered-grants.csv'
    >
        
    </VisualisationCard>
  )
}

export default Card