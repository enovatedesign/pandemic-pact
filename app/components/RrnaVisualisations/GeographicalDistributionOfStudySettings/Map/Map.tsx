import { useContext, useMemo, useState } from "react"

import { RrnaFilterContext } from "@/app/helpers/filters"
import { rrnaMapControlState } from "@/app/helpers/types"
import { prepareGeoJsonAndColourScale } from "./prepareGeojsonAndColourScale"
import rrnaSelectOptions from '@/data/dist/rrna/select-options.json'

import InteractiveMap from "../../../GrantsByCountryWhereResearchWasConducted/Map/InteractiveMap"
import StatusBar from "./StatusBar"
import MapControls from "./MapControls"

const Map = () => {
    const { studies } = useContext(RrnaFilterContext)
    
    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
    
    const allResearchDomainValues = rrnaSelectOptions['Research Domain'].map(option => option.value)

    const [mapControlState, setMapControlState] = useState<rrnaMapControlState>({
        locationType: 'countries',
        filteredResearchDomains: allResearchDomainValues // Set base state as all
    })
    
    const onClick = (featureId: string | null) => {
        setSelectedFeatureId(featureId)
    }

    // Set the available articles to those that have country information provided and 
    // Filter the dataset to the active researchDomain based on the mapControlState.researchDomain
    // controlled via the radio buttons
    const availableCountries = useMemo(() => {
        const filters: { [key: string]: (data: any) => boolean } = {
            countries: data => data['StudyCountry']?.length > 0,
            regions: data => data['StudyCountry']?.length > 0,
        }
        
        let countries = studies.filter(
            filters[mapControlState.locationType]
        )
        
        if (mapControlState.filteredResearchDomains.length > 0) {
            countries = countries.filter(country => 
                country['Domains']?.some((domain: string) => 
                    mapControlState.filteredResearchDomains.includes(domain)
                )
            )
        }

        return countries
    }, [studies, mapControlState.locationType, mapControlState.filteredResearchDomains]) 

    const { geojson, colourScale, selectedFeatureProperties } = useMemo(
        () =>
            prepareGeoJsonAndColourScale(
                mapControlState,
                selectedFeatureId,
                availableCountries
            ),
        [
            mapControlState,
            selectedFeatureId,
            availableCountries
        ]
    )

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <InteractiveMap geojson={geojson} onClick={onClick}/>
            </div>

            {selectedFeatureProperties && (
                <StatusBar 
                    mapControlState={mapControlState} 
                    articles={availableCountries}
                    selectedFeatureProperties={selectedFeatureProperties}
                    setSelectedFeatureId={setSelectedFeatureId} 
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

export default Map