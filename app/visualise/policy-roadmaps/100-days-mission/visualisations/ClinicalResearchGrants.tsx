"use client"

import { Fragment, useContext, useMemo, useState } from "react"

import { GlobalFilterContext } from "@/app/helpers/filters"
import { prepareBarChartData } from "@/app/helpers/bar-list"
import { 
    hundredDaysMissionResearchAreaDimColours, 
    hundredDaysMissionResearchAreaBrightColours 
} from "@/app/helpers/colours"

import VisualisationCard from "@/app/components/VisualisationCard"
import BarList from "@/app/components/BarList/BarList"
import BarListRow from "@/app/components/BarList/BarListRow"
import BarListRowHeading from "@/app/components/BarList/BarListRowHeading"
import Switch from "@/app/components/Switch"

const ClinicalResearchGrants = () => {
    const { grants } = useContext(GlobalFilterContext)
    const [showDataManagement, setShowDataManagement] = useState(false)

    const chartData = useMemo(() => {
        const dataManagedField = showDataManagement ? {
            field: 'Tags',
            value: '1'
        } : undefined
        
        return prepareBarChartData(grants, 'HundredDaysMissionResearchArea', undefined, dataManagedField)
    }, [grants, showDataManagement])

    return (
        <VisualisationCard
            id="distribution-of-clinical-research-grants-by-research-area"
            title="Distribution Of Research Grants By Research Area"
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder. Grants on data management and data sharing explore processes on collecting, organising, storing, and maintaining data on DTV research."
            filenameToFetch='100-days-mission/100-days-mission-grants.csv'
            filteredFileName='100-days-mission-filtered-grants.csv'
        >
            <Switch
                checked={showDataManagement}
                onChange={setShowDataManagement}
                label="Show Data Management & Data Sharing Grants"
                theme="light"
            />

            <div className="w-full">
                <BarList
                    data={chartData}
                    brightColours={hundredDaysMissionResearchAreaBrightColours}
                    dimColours={hundredDaysMissionResearchAreaDimColours}
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
            </div>
        </VisualisationCard>
    )
}

export default ClinicalResearchGrants