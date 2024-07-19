'use client'

import { useMemo } from 'react'
import InteractiveMap from './InteractiveMap'
import countryGeojson from '../../public/data/geojson/countries.json'
import { brandColours } from '../helpers/colours'
import { scaleLog } from 'd3-scale'
import dataset from '../../public/data/grants.json'

export default function Page() {
    const geojson = useMemo(() => {
        const countryTotals = new Map<string, number>()

        countryGeojson.features.forEach(feature => {
            const id = feature.properties.id

            const grants = (dataset as any).filter((grant: any) =>
                grant.FunderCountry.includes(id),
            )

            const totalGrants = grants.length

            countryTotals.set(feature.properties.id, totalGrants)
        })

        const allTotalGrants = Array.from(countryTotals.values()).filter(
            value => value > 0,
        )

        const colourScale = scaleLog<string>()
            .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        return {
            ...countryGeojson,
            features: countryGeojson.features.map(feature => {
                const total = countryTotals.get(feature.properties.id) ?? 0

                const colour = total ? colourScale(total) : '#D6D6DA'

                console.log('Colour for', feature.properties.id, colour)

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        colour,
                    },
                }
            }),
        }
    }, [countryGeojson])

    return <InteractiveMap geojson={geojson} />
}
