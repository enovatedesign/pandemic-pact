import { scaleLog } from 'd3-scale'
import { ColorTranslator } from 'colortranslator'
import { groupBy, sumBy } from 'lodash'

import countryGeojson from '../../../../public/data/geojson/countries.json'
import whoRegionGeojson from '../../../../public/data/geojson/who-regions.json'
import { brandColours } from '../../../helpers/colours'
import type { MapControlState } from './types'

import selectOptions from '../../../../data/dist/select-options.json'

export default function prepareGeoJsonAndColourScale(
    dataset: any[],
    mapControlState: MapControlState,
    grantField: string,
    selectedFeatureId: string | null,
    highlightJointFundedCountries: boolean,
    showCapacityStrengthening?: boolean
) {
    const geojson = mapControlState.displayWhoRegions
        ? { ...whoRegionGeojson }
        : { ...countryGeojson }

    geojson.features = geojson.features.map((feature: any) => {
        const id = feature.properties.id

        const name = selectOptions[
            grantField as keyof typeof selectOptions
        ].find(option => option.value === id)?.label

        const grants = dataset.filter((grant: any) =>
            grant[grantField].includes(id),
        ).map(grant => ({
            ...grant,
            GrantAmountConverted: Number(grant['GrantAmountConverted']),
        }))

        const totalGrants = grants.length

        const totalAmountCommitted = sumBy(grants, 'GrantAmountConverted')

        let properties: any = {
            id,
            name,
            totalGrants,
            totalAmountCommitted,
        }

        if (highlightJointFundedCountries) {
            const jointGrants = grants.filter(
                (grant: any) =>
                    grant[grantField].includes(selectedFeatureId) &&
                    grant[grantField].length > 1,
            ).map(grant => ({
                ...grant,
                GrantAmountConverted: Number(grant['GrantAmountConverted'])
            }))
            
            properties.totalJointGrants = jointGrants.length
            properties.totalJointAmountCommitted = sumBy(jointGrants, 'GrantAmountConverted')
        }

        if (showCapacityStrengthening) {
            const capacityStrengtheningGrants = grants.filter(grant => 
                grant[grantField].includes(selectedFeatureId) && 
                grant['HundredDaysMissionCapacityStrengthening'].length > 0
            ).map(grant => ({
                ...grant,
                GrantAmountConverted: Number(grant['GrantAmountConverted'])
            }))

            properties.totalJointGrants = capacityStrengtheningGrants.length
            properties.totalJointAmountCommitted = sumBy(capacityStrengtheningGrants, 'GrantAmountConverted')
        }

        return {
            ...feature,
            properties,
        }
    })

    let key: string

    if (highlightJointFundedCountries) {
        key = mapControlState.displayKnownFinancialCommitments
            ? 'totalJointAmountCommitted'
            : 'totalJointGrants'
    } else {
        key = mapControlState.displayKnownFinancialCommitments
            ? 'totalAmountCommitted'
            : 'totalGrants'
    }

    const allTotalGrants = geojson.features
        .filter((country: any) => country.properties[key])
        .map((country: any) => country.properties[key])

    const colourKey = highlightJointFundedCountries ? 
        'orange' : 
        'teal'

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

        if (highlightJointFundedCountries) {
            selectedFeatureProperties.jointFeatureProperties = geojson.features
                .filter(
                    (feature: any) =>
                        feature.properties.id !== selectedFeatureId &&
                        feature.properties.totalJointGrants > 0,
                )
                .map((feature: any) => feature.properties)
        }

    }


    return { geojson, colourScale, selectedFeatureProperties }
}

function convertCssColourToDeckGLFormat(colour: string) {
    const colourTranslator = new ColorTranslator(colour)

    return [colourTranslator.R, colourTranslator.G, colourTranslator.B]
}
