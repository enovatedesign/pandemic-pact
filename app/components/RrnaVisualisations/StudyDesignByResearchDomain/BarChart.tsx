import { Fragment } from "react"
import { ResponsiveContainer, XAxis, YAxis, BarChart as RechartBarChart, Bar, Cell, Tooltip } from "recharts"
import { rrnaStudyDesignColours } from "@/app/helpers/colours"
import { RRNA_STUDY_DESIGN_ORDER, orderByReference } from "@/app/helpers/rrnaConstants"
import TooltipContent from "../../TooltipContent"
import BarListRowHeading from "../../BarList/BarListRowHeading"

interface Props {
    chartData: any[]
    highestValue: number
}

const BarChart = ({ 
    chartData,
    highestValue
}: Props) => {
    return (
        <div className="relative w-full">
            {chartData.map((data) => {
                const { label, totalCount } = data
                const barsList = orderByReference(
                    Object.keys(data).filter(key => key !== 'label' && key !== 'totalCount'),
                    RRNA_STUDY_DESIGN_ORDER
                )

                return (
                    <Fragment key={label}>
                        <BarListRowHeading>
                            <p className="bar-chart-category-label text-gray-600 text-sm">
                                {label}
                            </p>
                        </BarListRowHeading>

                        <div className="grid grid-cols-12">
                            <ResponsiveContainer width="100%" height={20} className="col-span-11">
                                <RechartBarChart
                                    data={[data]}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, highestValue]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="parentLabel"
                                        axisLine={false}
                                        tickLine={false}
                                        hide={true}
                                    />

                                    <Tooltip
                                        content={BarListRowTooltipContent}
                                        animationDuration={0}
                                        wrapperStyle={{ zIndex: 1 }}
                                        cursor={false}
                                    />

                                    {barsList.map((label: string, index: number) => (
                                        <Bar
                                            key={label}
                                            dataKey={label}
                                            stackId="a"
                                            barSize={20}
                                            background={index === 0 ? { fill: '#eee' } : undefined}
                                            activeBar={false}
                                        >
                                            {chartData.map((data, index) => (
                                                <Cell 
                                                    key={`cell-${data}-${index}`} 
                                                    fill={rrnaStudyDesignColours[label as keyof typeof rrnaStudyDesignColours]} 
                                                />
                                            ))}
                                        </Bar>
                                    ))}
                                </RechartBarChart>
                            </ResponsiveContainer>

                            <p className="total-grants-number text-xs text-gray-600 flex items-center pl-2">{totalCount}</p>
                        </div>
                    </Fragment>
                )
            })}
        </div>
    )
}

export default BarChart

function BarListRowTooltipContent(props: any) {
    const payload = props && props.payload ? props.payload : []
    const items = payload
        .filter((item: any) => 
            item['dataKey'] !== 'totalCount' &&
            item['value'] > 0
        ).map((item: any) => ({
            label: item['dataKey'],
            value: item['value'],
            colour: rrnaStudyDesignColours[item['dataKey'] as keyof typeof rrnaStudyDesignColours]
        })
    ).sort((a: any, b: any) => b['value'] - a['value'])

    return <TooltipContent items={items} />
}
