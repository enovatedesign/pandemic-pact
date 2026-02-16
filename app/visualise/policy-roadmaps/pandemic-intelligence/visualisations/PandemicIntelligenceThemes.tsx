"use client"
import { Fragment, useContext, useMemo } from 'react'

import { GlobalFilterContext } from '@/app/helpers/filters'

import { pandemicIntelligenceThemeColours, pandemicIntelligenceThemeDimColours } from '@/app/helpers/colours'
import { prepareBarChartData } from '@/app/helpers/bar-list'

import VisualisationCard from '@/app/components/VisualisationCard'
import BarList from '@/app/components/BarList/BarList'
import BarListRow from '@/app/components/BarList/BarListRow'
import BarListRowHeading from '@/app/components/BarList/BarListRowHeading'

const PandemicIntelligenceThemes = () => {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => {
        return prepareBarChartData(grants, 'PandemicIntelligenceThemes')
    }, [grants])

    return (
        <VisualisationCard
            id="research-themes"
            title="Distribution of grants by Pandemic and Epidemic Intelligence themes"
            subtitle="Bar chart showing grants by theme and known funding amounts"
            filenameToFetch='pandemic-intelligence/pandemic-intelligence-grants.csv'
            filteredFileName='pandemic-intelligence-filtered-grants.csv'
        >
            <BarList
                data={chartData}
                brightColours={pandemicIntelligenceThemeColours}
                dimColours={pandemicIntelligenceThemeDimColours}
            >
                {chartData.map((datum: any, index: number) => (
                    <Fragment key={datum['Category Value']}>
                        <BarListRowHeading>
                            <p className="bar-chart-category-label text-gray-600 text-sm">
                                {datum['Category Label']}
                            </p>
                        </BarListRowHeading>

                        <BarListRow dataIndex={index} />
                    </Fragment>
                ))}
            </BarList>
        </VisualisationCard>
    )
}

export default PandemicIntelligenceThemes