import {BarChart as TremorBarChart, Color} from "@tremor/react"
import {groupBy} from 'lodash'

interface Props {
    dataset: any[],
    selectedPathogens: string[],
}

export default function BarChart({dataset, selectedPathogens}: Props) {
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

    const data = Object.entries(
        groupBy(dataset, 'ResearchInstitutionCountry')
    ).map(([country, grants]) => {
        if (selectedPathogens.length === 0) {
            return {
                country,
                'All Pathogens': grants.length,
            }
        }

        return {
            country,
            ...Object.fromEntries(
                selectedPathogens.map(pathogen => ([
                    pathogen,
                    grants.filter(grant => grant.Pathogen.includes(pathogen)).length,
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
            stack
        />
    )
}
