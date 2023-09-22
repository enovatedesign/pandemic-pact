import {BarChart as TremorBarChart, Color} from "@tremor/react"
import {groupBy} from 'lodash'

interface Props {
    dataset: any[]
}

export default function BarChart({dataset}: Props) {
    const categories = [
        'All Pathogens',
    ]

    const colours: Color[] = [
        'blue',
    ]

    const data = Object.entries(
        groupBy(dataset, 'ResearchInstitutionCountry')
    ).map(([country, grants]) => ({
        country,
        'All Pathogens': grants.length,
    }))

    return (
        <TremorBarChart
            data={data}
            index="country"
            categories={categories}
            colors={colours}
            showLegend={false}
            className="h-[36rem] -ml-2"
            layout="vertical"
        />
    )
}
