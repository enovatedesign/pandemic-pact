import {BarChart as TremorBarChart, Color} from "@tremor/react"
import {groupBy} from 'lodash'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'

interface Props {
    dataset: any[],
    selectedPathogens: string[],
    displayWhoRegions: boolean,
}

export default function BarChart({dataset, selectedPathogens, displayWhoRegions}: Props) {
    const categories = (selectedPathogens.length === 0) ? ['All Pathogens'] : selectedPathogens

    const colours: Color[] = [
        'blue',
        'lime',
        'cyan',
        'violet',
        'orange',
        'emerald',
        'indigo',
        'purple',
        'amber',
        'green',
        'red',
        'fuchsia',
        'yellow',
        'neutral',
    ]

    let data: any = []

    if (displayWhoRegions) {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(dataset, 'ResearchInstitutionRegion')

        data = whoRegions.map(region => [
            region,
            grantsGroupedByRegion[region] ?? [],
        ])
    } else {
        data = Object.entries(
            groupBy(dataset, 'ResearchInstitutionCountry')
        )
    }

    data = data.sort(
        ([countryA, grantsA], [countryB, grantsB]) => grantsB.length - grantsA.length
    )

    const maxBars = 6

    if (data.length > maxBars) {
        const smallestCountries = data.splice(maxBars - 1)

        data.push([
            'Other',
            smallestCountries.reduce(
                (combinedGrants: any[], [country, grants]: [string, any]) => {
                    return combinedGrants.concat(grants)
                },
                []
            )
        ])
    }

    data = data.map(([country, grants]: [string, any]) => {
        if (selectedPathogens.length === 0) {
            return {
                country,
                'All Pathogens': grants.reduce(...sumNumericGrantAmounts),
            }
        }

        return {
            country,
            ...Object.fromEntries(
                selectedPathogens.map(pathogen => ([
                    pathogen,
                    grants.filter((grant: any) => grant.Pathogen
                        .includes(pathogen))
                        .reduce(...sumNumericGrantAmounts)
                ]))
            ),
        }
    })

    return (
        <TremorBarChart
            data={data}
            index="country"
            categories={categories}
            colors={colours}
            showLegend={false}
            className="h-[36rem] -ml-2"
            layout="vertical"
            valueFormatter={dollarValueFormatter}
            stack
        />
    )
}
