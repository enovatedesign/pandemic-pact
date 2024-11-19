import { useContext, useMemo, useState } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import StatusBar from './StatusBar'
import prepareGeoJsonAndColourScale from './prepareGeoJsonAndColourScale'
import type { MapControlState } from './types'
import NoDataText from '../../NoData/NoDataText'

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
    
    // Assign a variable to check every feature in the geojson
    // If totalAmountCommitted = 0 and totalGrants = 0 for every feature, no map data is available
    const mapDataIsNotAvailable = geojson.features.every((feature: any) => 
        (feature.properties.totalAmountCommitted === 0) &&
        (feature.properties.totalGrants === 0)
    )
    
    const mapWrapperClasses = [
        'w-full h-full flex flex-col gap-y-4',
        mapDataIsNotAvailable && 'blur-md'
    ].filter(Boolean).join(' ')
    
    return (
        <div className="w-full relative">
            <div className={mapWrapperClasses}>
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
                    setHighlightJointFundedCountries={
                        setHighlightJointFundedCountries
                    }
                    colourScale={colourScale}
                />
            </div>

            {mapDataIsNotAvailable && <NoDataText/>}
        </div>
    )
}
