import { useContext, useMemo, useState } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import StatusBar from './StatusBar'
import prepareGeoJsonAndColourScale from './prepareGeoJsonAndColourScale'
import type { MapControlState } from './types'
import NoDataText from '../../NoData/NoDataText'

export default function Map({
    showColourScaleOnly = false, 
    highlightJointFundedOnClick = false,
    showJointFundedByDefault = false,
    showCapacityStrengthening = false
}: { 
    showColourScaleOnly?: boolean 
    highlightJointFundedOnClick?: boolean
    showJointFundedByDefault?: boolean
    showCapacityStrengthening?: boolean
}) {
    const { grants } = useContext(GlobalFilterContext)
    
    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)

    const [highlightJointFundedCountries, setHighlightJointFundedCountries] = useState<boolean>(false)

    const [mapControlState, setMapControlState] = useState<MapControlState>({
        displayKnownFinancialCommitments: false,
        displayWhoRegions: false,
        locationType: 'Funder',
    })

    const onClick = (featureId: string | null) => {
        setSelectedFeatureId(featureId)
        
        highlightJointFundedOnClick && setHighlightJointFundedCountries(true)
    }

    const grantField =
        mapControlState.locationType +
        (mapControlState.displayWhoRegions ? 'Region' : 'Country')

    const { geojson, colourScale, selectedFeatureProperties } = useMemo(
        () =>
            prepareGeoJsonAndColourScale(
                grants,
                mapControlState,
                grantField,
                selectedFeatureId,
                highlightJointFundedCountries,
                showCapacityStrengthening
            ),
        [
            grants,
            mapControlState,
            grantField,
            selectedFeatureId,
            highlightJointFundedCountries,
            showCapacityStrengthening
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
                        highlightJointFundedOnClick={highlightJointFundedOnClick}
                        highlightJointFundedCountries={
                            highlightJointFundedCountries
                        }
                        setHighlightJointFundedCountries={
                            setHighlightJointFundedCountries
                        }
                        grantField={grantField}
                        showJointFundedByDefault={showJointFundedByDefault}
                        showCapacityStrengthening={showCapacityStrengthening}
                    />
                )}

                <MapControls
                    mapControlState={mapControlState}
                    setMapControlState={setMapControlState}
                    setHighlightJointFundedCountries={
                        setHighlightJointFundedCountries
                    }
                    colourScale={colourScale}
                    showColourScaleOnly={showColourScaleOnly}
                />
            </div>

            {mapDataIsNotAvailable && <NoDataText/>}
        </div>
    )
}
