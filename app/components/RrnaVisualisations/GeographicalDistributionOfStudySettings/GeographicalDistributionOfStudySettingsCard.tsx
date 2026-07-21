"use client"

import React, { useRef } from 'react'
import { GlobeAltIcon, ChartBarIcon } from '@heroicons/react/outline'

import { DeckGlRef, DeckGLRefContext } from '@/app/helpers/deck-gl'

import Map from './Map/Map'
import Bars from './Bars/Bars'
import RrnaVisualisationCard from '../RrnaVisualisationCard'

const GeographicalDistributionOfStudySettingsCard = () => {
    const deckGlRef = useRef<DeckGlRef>(null)

    const tabs = [
        {
            tab: { icon: GlobeAltIcon, label: 'Map' },
            content: <Map />,
        },
        {
            tab: { icon: ChartBarIcon, label: 'Bars' },
            content: <Bars />,
        },
    ]

    return (
        <DeckGLRefContext.Provider value={deckGlRef}>
            <RrnaVisualisationCard
                id="geographical-map-of-study-settings"
                title="Geographical Map of Study Settings"
                subtitle="Explore the chart for country specific study information."
                footnote="Some studies are undertaken in multiple countries. The information represents the data on study settings available. If a location is not presented it means that there was no study set in that country."
                tabs={tabs}
            />
        </DeckGLRefContext.Provider>
    )
}

export default GeographicalDistributionOfStudySettingsCard