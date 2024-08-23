import VisualisationCard from '../VisualisationCard'
import { ChartBarIcon, GlobeIcon } from '@heroicons/react/solid'
import Map from './Map/Map'
import BarChart from './BarChart'

export default function GrantsByCountryWhereResearchWasConductedCard() {
    const tabs = [
        {
            tab: {
                icon: GlobeIcon,
                label: 'Map',
            },
            content: <Map />,
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: 'Bars',
            },
            content: <BarChart />,
        },
    ]

    return (
        <VisualisationCard
            id="grants-by-country-where-research-was-conducted"
            title="Global Map of Geographical Distribution of Funding Organisations OR Research Locations"
            subtitle="The information on the research location was collected where available from the grant application, and can be different to the location of research institution. Click on a country to see country-specific grant information (including joint-funded grants)."
            footnote="Please note: Funding amounts are included only when they have been published by the funder. Some research projects are undertaken in multiple locations (countries) and some are funded by multiple funders. Where research location is not explicitly specified the default used is the location of the research institution receiving the funds."
            tabs={tabs}
        />
    )
}
