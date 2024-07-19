'use client'

import { useMemo, useState } from 'react'
import InteractiveMap from './InteractiveMap'
import countryGeojson from '../../public/data/geojson/countries.json'
import { brandColours } from '../helpers/colours'
import { scaleLog } from 'd3-scale'
import dataset from '../../public/data/grants.json'
import selectOptions from '../../data/dist/select-options.json'
import { CountrySummary } from './types'
import StatusBar from './StatusBar'

export default function Page() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

    const countrySummaries = useMemo(() => {
        const countrySummaries = new Map<string, CountrySummary>()

        selectOptions.FunderCountry.forEach(
            ({ value: id, label }: { value: string; label: string }) => {
                const grants = (dataset as any).filter((grant: any) =>
                    grant.FunderCountry.includes(id),
                )

                const totalGrants = grants.length

                countrySummaries.set(id, {
                    id,
                    name: label,
                    totalGrants,
                    totalFunding: 0, // TODO
                })
            },
        )

        return countrySummaries
    }, [dataset, selectOptions])

    const geojson = useMemo(() => {
        const allTotalGrants = Array.from(countrySummaries.values())
            .map(({ totalGrants }) => totalGrants)
            .filter(value => value > 0)

        const colourScale = scaleLog<string>()
            .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        return {
            ...countryGeojson,
            features: countryGeojson.features.map(feature => {
                const total =
                    countrySummaries.get(feature.properties.id)?.totalGrants ??
                    0

                const colour = total ? colourScale(total) : '#D6D6DA'

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        colour,
                    },
                }
            }),
        }
    }, [countryGeojson, countrySummaries])

    const selectedCountrySummary = useMemo(() => {
        if (!selectedCountry) {
            return null
        }

        return countrySummaries.get(selectedCountry)
    }, [selectedCountry, countrySummaries])

    return (
        <>
            <InteractiveMap
                geojson={geojson}
                setSelectedCountry={setSelectedCountry}
            />

            {selectedCountrySummary && (
                <StatusBar countrySummary={selectedCountrySummary} />
            )}
        </>
    )
}
