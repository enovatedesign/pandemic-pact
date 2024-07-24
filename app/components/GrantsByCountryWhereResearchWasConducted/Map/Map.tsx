import { useContext, useMemo, useState } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import StatusBar from './StatusBar'
import prepareGeoJsonAndColourScale from './prepareGeoJsonAndColourScale'
import type { FeatureProperties, MapControlState } from './types'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const [selectedFeature, setSelectedFeature] =
        useState<FeatureProperties | null>(null)

    const [highlightJointFundedCountries, setHighlightJointFundedCountries] =
        useState<boolean>(false)

    const [mapControlState, setMapControlState] = useState<MapControlState>({
        displayKnownFinancialCommitments: false,
        displayWhoRegions: false,
        locationType: 'Funder',
    })

    const onClick = (properties: FeatureProperties) => {
        setSelectedFeature(properties)
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
                <InteractiveMap geojson={geojson} onClick={onClick} />
            </div>

            {selectedFeature && (
                <StatusBar
                    selectedFeature={selectedFeature}
                    setSelectedFeature={setSelectedFeature}
                    highlightJointFundedCountries={
                        highlightJointFundedCountries
                    }
                    setHighlightJointFundedCountries={
                        setHighlightJointFundedCountries
                    }
                    grantField={grantField}
                />
            )}

            <MapControls
                mapControlState={mapControlState}
                setMapControlState={setMapControlState}
                colourScale={colourScale}
            />
        </div>
    )
}
