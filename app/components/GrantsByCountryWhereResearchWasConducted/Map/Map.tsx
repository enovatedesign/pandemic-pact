import { useContext, useMemo, useState } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import StatusBar from './StatusBar'
import prepareGeoJsonAndColourScale from './prepareGeoJsonAndColourScale'
import type { MapControlState } from './types'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
        null,
    )

    const [highlightJointFundedCountries, setHighlightJointFundedCountries] =
        useState<boolean>(false)

    const [mapControlState, setMapControlState] = useState<MapControlState>({
        displayKnownFinancialCommitments: false,
        displayWhoRegions: false,
        locationType: 'Funder',
    })

    const onClick = (featureId: string | null) => {
        setSelectedFeatureId(featureId)
    }

    const grantField =
        mapControlState.locationType +
        (mapControlState.displayWhoRegions ? 'Region' : 'Country')

    const { geojson, colourScale, selectedFeatureProperties } = useMemo(
        () =>
            prepareGeoJsonAndColourScale(
                dataset,
                mapControlState,
                grantField,
                selectedFeatureId,
                highlightJointFundedCountries,
            ),
        [
            dataset,
            mapControlState,
            grantField,
            selectedFeatureId,
            highlightJointFundedCountries,
        ],
    )

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <InteractiveMap geojson={geojson} onClick={onClick} />
            </div>

            {selectedFeatureProperties && (
                <StatusBar
                    selectedFeatureProperties={selectedFeatureProperties}
                    setSelectedFeatureId={setSelectedFeatureId}
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
