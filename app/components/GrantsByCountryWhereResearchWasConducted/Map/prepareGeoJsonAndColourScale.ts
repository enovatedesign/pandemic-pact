import { scaleLog } from 'd3-scale'
import { ColorTranslator } from 'colortranslator'
import countryGeojson from '../../../../public/data/geojson/countries.json'
import whoRegionGeojson from '../../../../public/data/geojson/who-regions.json'
import { sumNumericGrantAmounts } from '../../../helpers/reducers'
import { brandColours } from '../../../helpers/colours'
import selectOptions from '../../../../data/dist/select-options.json'
import type { FeatureProperties, MapControlState } from './types'

export default function prepareGeoJsonAndColourScale(
    dataset: any[],
    mapControlState: MapControlState,
    grantField: string,
    selectedFeatureId: string | null,
    highlightJointFundedCountries: boolean,
) {
    const geojson = mapControlState.displayWhoRegions
        ? { ...whoRegionGeojson }
        : { ...countryGeojson }

    geojson.features = geojson.features.map((feature: any) => {
        const id = feature.properties.id

        const name = selectOptions[
            grantField as keyof typeof selectOptions
        ].find(option => option.value === id)?.label

        const filterCallback = highlightJointFundedCountries
            ? (grant: any) =>
                  grant[grantField].includes(id) &&
                  grant[grantField].includes(selectedFeatureId) &&
                  grant[grantField].length > 1
            : (grant: any) => grant[grantField].includes(id)

        const grants = dataset.filter(filterCallback)

        const totalGrants = grants.length

        const totalAmountCommitted = grants.reduce(...sumNumericGrantAmounts)

        return {
            ...feature,
            properties: {
                id,
                name,
                totalGrants,
                totalAmountCommitted,
            },
        }
    })

    const key = mapControlState.displayKnownFinancialCommitments
        ? 'totalAmountCommitted'
        : 'totalGrants'

    const allTotalGrants = geojson.features
        .filter((country: any) => country.properties[key])
        .map((country: any) => country.properties[key])

    const colourKey = highlightJointFundedCountries ? 'orange' : 'teal'

    const colourScale = scaleLog<string>()
        .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
        .range([brandColours[colourKey]['300'], brandColours[colourKey]['700']])

    geojson.features = geojson.features.map((feature: any) => {
        const value = feature.properties[key] ?? null

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
                fillColour: convertCssColourToDeckGLFormat(fillColour),
            },
        }
    })

    let selectedFeatureProperties: any = null

    if (selectedFeatureId) {
        selectedFeatureProperties = geojson.features.find(
            (feature: any) => feature.properties.id === selectedFeatureId,
        )?.properties
    }

    return { geojson, colourScale, selectedFeatureProperties }
}

function convertCssColourToDeckGLFormat(colour: string) {
    const colourTranslator = new ColorTranslator(colour)

    return [colourTranslator.R, colourTranslator.G, colourTranslator.B]
}
