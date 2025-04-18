import { useRef } from 'react'
import { ChartBarIcon, GlobeIcon } from '@heroicons/react/solid'
import VisualisationCard from '../VisualisationCard'
import Map from './Map/Map'
import BarChart from './BarChart'
import { DeckGLRefContext } from '../../helpers/deck-gl'
import type { DeckGlRef } from '../../helpers/deck-gl'

export default function GrantsByCountryWhereResearchWasConductedCard() {
    const deckGlRef = useRef<DeckGlRef>(null)

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
        <DeckGLRefContext.Provider value={deckGlRef}>
            <VisualisationCard
                id="grants-by-country-where-research-was-conducted"
                title="Global Map of Geographical Distribution of Funding Organisations OR Research Locations"
                subtitle="The information on the research location was collected where available from the grant application, and can be different to the location of research institution. Click on a country to see country-specific grant information (including joint-funded grants)."
                footnote="Please note: Funding amounts are included only when they have been published by the funder. Some research projects are undertaken in multiple locations (countries). Some are funded by multiple funders, the breakdown of joint-funded projects can be found when selecting a country and 'show joint-funded countries'. Where research location is not explicitly specified the default used is the location of the research institution receiving the funds."
                tabs={tabs}
            />
        </DeckGLRefContext.Provider>
    )
}
