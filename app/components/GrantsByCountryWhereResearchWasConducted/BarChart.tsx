import {useState} from 'react'

interface Props {
    dataset: any[]
}

export default function BarChart({dataset}: Props) {
    return (
        <BarChart
            data={amountCommittedToEachResearchCategoryOverTime}
            index="year"
            categories={researchCategories}
            valueFormatter={valueFormatter}
            colors={colours}
            showLegend={false}
            className="h-[36rem] -ml-2"
        />
    )
}
