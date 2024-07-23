import { useState, useMemo, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { GlobalFilterContext } from '../../../helpers/filters'
import { TooltipContext } from '../../../helpers/tooltip'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import TooltipContent from './TooltipContent'
import prepareGeoJsonAndColourScale from './prepareGeoJsonAndColourScale'
import type { FeatureProperties, MapControlState } from './types'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const { tooltipRef } = useContext(TooltipContext)

    const router = useRouter()

    const [mapControlState, setMapControlState] = useState<MapControlState>({
        displayKnownFinancialCommitments: false,
        displayWhoRegions: false,
        locationType: 'Funder',
    })

    const onMouseEnterOrMove = (
        position: { x: number; y: number },
        properties: FeatureProperties,
    ) => {
        tooltipRef?.current?.open({
            position,
            content: (
                <TooltipContent
                    properties={properties}
                    displayWhoRegions={mapControlState.displayWhoRegions}
                />
            ),
        })
    }

    const onMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const onClick = (properties: FeatureProperties) => {
        const queryFilters = {
            [grantField]: [properties.id],
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    const grantField =
        mapControlState.locationType +
        (mapControlState.displayWhoRegions ? 'Region' : 'Country')

    const [geojson, colourScale] = useMemo(() => {
        return prepareGeoJsonAndColourScale(
            dataset,
            mapControlState,
            grantField,
        )
    }, [dataset, mapControlState, grantField])

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <InteractiveMap
                    geojson={geojson}
                    onMouseEnterOrMove={onMouseEnterOrMove}
                    onMouseLeave={onMouseLeave}
                    onClick={onClick}
                />
            </div>

            <MapControls
                mapControlState={mapControlState}
                setMapControlState={setMapControlState}
                colourScale={colourScale}
            />
        </div>
    )
}
