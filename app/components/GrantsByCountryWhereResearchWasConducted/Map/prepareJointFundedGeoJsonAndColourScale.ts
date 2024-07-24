import { scaleLog } from 'd3-scale'
import type { FeatureProperties, MapControlState } from './types'
import countryGeojson from '../../../../public/data/geojson/countries.json'
import whoRegionGeojson from '../../../../public/data/geojson/who-regions.json'
import { sumNumericGrantAmounts } from '../../../helpers/reducers'
import { brandColours } from '../../../helpers/colours'
import selectOptions from '../../../../data/dist/select-options.json'

export default function prepareGeoJsonAndColourScale(
    dataset: any[],
    mapControlState: MapControlState,
    grantField: string,
    selectedFeature: FeatureProperties,
) {
    const geojson = mapControlState.displayWhoRegions
        ? { ...whoRegionGeojson }
        : { ...countryGeojson }

    geojson.features = geojson.features.map((feature: any) => {
        const id = feature.properties.id

        const name = selectOptions[
            grantField as keyof typeof selectOptions
        ].find(option => option.value === id)?.label

        const grants = dataset.filter(
            grant =>
                grant[grantField].includes(id) &&
                grant[grantField].includes(selectedFeature.id) &&
                grant[grantField].length > 1,
        )

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

    const selectedFeatureColorScale = scaleLog<string>()
        .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
        .range([brandColours.blue['300'], brandColours.blue['700']])

    const jointColourScale = scaleLog<string>()
        .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
        .range([brandColours.orange['300'], brandColours.orange['700']])

    geojson.features = geojson.features.map((feature: any) => {
        const value = feature.properties[key] ?? null

        const scale =
            feature.properties.id === selectedFeature.id
                ? selectedFeatureColorScale
                : jointColourScale

        const colour = value ? scale(value) : '#D6D6DA'

        return {
            ...feature,
            properties: {
                ...feature.properties,
                colour,
            },
        }
    })

    return { geojson, scales: [selectedFeatureColorScale, jointColourScale] }
}
