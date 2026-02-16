"use client"

import { useContext, useMemo } from "react"
import { 
  ResponsiveContainer, 
  BarChart, 
  XAxis, 
  YAxis, 
  Bar, 
  Cell, 
  Tooltip
} from "recharts"
import selectOptions from '../../../../../../data/dist/select-options.json'
import { GlobalFilterContext } from "@/app/helpers/filters"
import { prepareBarChartData } from "@/app/helpers/bar-list"
import { rechartBaseTooltipProps } from "@/app/helpers/tooltip"
import { hundredDaysMissionImplementationColours } from "@/app/helpers/colours"

import VisualisationCard from "@/app/components/VisualisationCard"
import ImplementationAndAccessTooltipContent from "./Tooptip"

const ImplementationAndAccess = () => {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => prepareBarChartData(
        grants, 
        'HundredDaysMissionImplementation', 
        'HundredDaysMissionResearchArea'
    ), [grants])
    
    const tooltipContent = (props: any) => {
        const label = props.payload[0]?.payload['Category Label']
        const tooltipGrantsData = props.payload[0]?.payload['Tooltip Grants']

        const summaryMapping = {
            'Manufacturing and logistics': 'Clinical trial manufacturing and logistics including research on supply chains related to Vaccines and therapeutics development. Does not include grants related to diagnostics.',
            'Health systems research': 'Grants on research on DTV implementation in health systems focussing on the delivery of DTV products by health workers, availability of products and delivery of health services. ',
            'Costs of products': 'Grants involving economic evaluation or cost-effectiveness analysis of DTVs',
            'Product acceptance': 'We identify grants on research assessing trust/ acceptance/uptake of DTVs and will visualise these on our dashboard.',
            'Equitable allocation': 'Grants involving research to inform ethical allocation of resources, including public health measures and medical countermeasures.'
        }
        
        return (
            <ImplementationAndAccessTooltipContent 
                title={label} 
                summary={summaryMapping[label as keyof typeof summaryMapping]} 
                items={tooltipGrantsData} 
            />
        )
    }
    
    return (
        <VisualisationCard
            id="distribution-of-grants-on-implementation-and-access-of-diagnostic-therapeutic-and-vaccines-products"
            title="Distribution Of Grants On Implementation of Clinical Research And Access Of Diagnostic, Therapeutic And Vaccines Products"
            infoModalContents="Hover on each bar to see a break down and description of each area"
            filenameToFetch='100-days-mission/100-days-mission-grants.csv'
            filteredFileName='100-days-mission-filtered-grants.csv'
        >
            <ResponsiveContainer width="100%" height={500}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 20, bottom: 20 }}
                >
                    <XAxis
                        type="number"
                        label={{
                            value: "Total Grants",
                            position: "bottom",
                            offset: 0,
                        }}
                    />

                    <YAxis
                        dataKey="Category Label"
                        type="category"
                        width={100}
                    />

                    <Tooltip
                        content={tooltipContent}
                        cursor={{ fill: "transparent" }}
                        {...rechartBaseTooltipProps}
                    />

                    <Bar
                        dataKey="Total Grants"
                    >
                        {chartData.map(({ "Category Label": label }) => (
                            <Cell
                                key={`cell-${label}`}
                                fill={hundredDaysMissionImplementationColours[label as keyof typeof hundredDaysMissionImplementationColours]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </VisualisationCard>
    )
}

export default ImplementationAndAccess