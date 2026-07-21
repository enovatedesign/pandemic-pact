import { scaleLog } from 'd3-scale'
import { ColorTranslator } from 'colortranslator'
import countryGeojson from '@/public/data/geojson/countries.json'
import whoRegionGeojson from '@/public/data/geojson/who-regions.json'
import { brandColours } from '@/app/helpers/colours'
import type { rrnaMapControlState } from '@/app/helpers/types'
import selectOptions from '@/data/dist/select-options.json'
import regionToCountryMapping from '@/data/source/region-to-country-mapping.json'

export const prepareGeoJsonAndColourScale = (
    mapControlState: rrnaMapControlState,
    selectedFeatureId: string | null,
    availableCountries: any[]
) => {
    const geojsonOptions = {
        'regions': {...whoRegionGeojson},
        'countries': {...countryGeojson},
    }
    
    // Set the active geojson based on the state of locationType controlled via the radio buttons
    const geojson = geojsonOptions[mapControlState.locationType]

    geojson.features = geojson.features.map((feature: any) => {
        const nameOptions = {
            'regions': selectOptions['ResearchInstitutionRegion']
                        .find(option =>
                            option.value === feature.properties.id
                    )?.label as string,
            'countries': (selectOptions['ResearchLocationCountry'] as { value: string; label: string }[])
                        .find(option => option.value === feature.properties.id)?.label ?? feature.properties.id,
        }

        const name = nameOptions[mapControlState.locationType]
        
        let properties: any = {
            id: feature.properties.id,
            name
        }

        return {
            ...feature,
            properties,
        }
    })

    const selectedFeatureProperties = selectedFeatureId
        ? geojson.features.find((feature: any) => feature.properties.id === selectedFeatureId)?.properties ?? null
        : null

    // When building the countryStudyCounts, use ISO_N3 codes
    const countryStudyCounts: Record<string, number> = availableCountries.reduce((counts, article) => {
        const countryCodes: string[] = article['StudyCountry'] // Now ISO_N3 codes

        countryCodes.forEach((iso_n3: string) => {
            counts[iso_n3] = (counts[iso_n3] || 0) + 1;
        })
        
        return counts
    }, {})
    
    const countryToRegion: Record<string, string> = {}
    for (const [regionId, countryCodes] of Object.entries(regionToCountryMapping)) {
        for (const code of countryCodes) {
            countryToRegion[code] = regionId
        }
    }

    const regionalStudyCounts: Record<string, number> = availableCountries.reduce((counts: Record<string, number>, study) => {
        const countryCodes: string[] = study['StudyCountry'] ?? []
        const regionsSeen = new Set<string>()
        countryCodes.forEach((iso_n3: string) => {
            const regionId = countryToRegion[iso_n3]
            if (regionId && !regionsSeen.has(regionId)) {
                regionsSeen.add(regionId)
                counts[regionId] = (counts[regionId] || 0) + 1
            }
        })
        return counts
    }, {})
    
    
    const articleCountOptions = {
        'regions': Object.values(regionalStudyCounts),
        'countries' : Object.values(countryStudyCounts),
    }
    
    const articleCounts = articleCountOptions[mapControlState.locationType]
    
    const minArticles = Math.min(...articleCounts)
    const maxArticles = Math.max(...articleCounts)
    
    const colourKey = 'teal'
    
    const colourScale = scaleLog<string>()
        .domain([Math.min(minArticles), Math.max(maxArticles)])
        .range([brandColours[colourKey]['300'], brandColours[colourKey]['700']])
    
    geojson.features = geojson.features.map((feature: any) => {
        const valueOptions = {
            'regions': regionalStudyCounts[feature.properties['id']],
            // Use the ISO_N3 code for country lookup
            'countries': countryStudyCounts[feature.properties['id']],
        }
        
        const value: number = valueOptions[mapControlState.locationType]
        
        const featureIsSelected = feature.properties.id === selectedFeatureId
        
        let fillColour: string
        
        if (featureIsSelected) {
            fillColour = brandColours.blue['600']
        } else {
            fillColour = value ? colourScale(value) : '#D6D6DA'
        }

        return {
            ...feature,
            properties: {
                ...feature.properties,
                total: value,
                fillColour: convertCssColourToDeckGLFormat(fillColour),
            },
        }
    })

    return { geojson, colourScale, selectedFeatureProperties }
}

function convertCssColourToDeckGLFormat(colour: string) {
    const colourTranslator = new ColorTranslator(colour)

    return [colourTranslator.R, colourTranslator.G, colourTranslator.B]
}
