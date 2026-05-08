import TooltipContent from '@/app/components/TooltipContent'
import { researchAreaByClinicalTrialPhaseColours } from '@/app/helpers/colours'
import { TooltipContext } from '@/app/helpers/tooltip'
import { dollarValueFormatter } from '@/app/helpers/value-formatters'
import { useContext, MouseEvent, Fragment } from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from 'recharts'

interface ClinicalTrialsStackedBarsProps {
    phase: string
    chartDataArray: any
    highestDomainValue: number
    keyWithHighestValue: string
    remainingBarsList: string[]
    endOfBarValue: string | number
    formatToDollar?: boolean
}

const ClinicalTrialsStackedBars = ({
    phase,
    chartDataArray,
    highestDomainValue,
    keyWithHighestValue,
    remainingBarsList,
    endOfBarValue,
    formatToDollar = false
}: ClinicalTrialsStackedBarsProps) => {
    
    const { tooltipRef } = useContext(TooltipContext)
    const onChartMouseEnterOrMove = (
        nextState: any,
        event: MouseEvent<SVGPathElement>,
        formatToDollar: boolean = false
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <ClinicalTrialsResearchAreasTooltipContent nextState={nextState} formatToDollar={formatToDollar}/>,
            })
        } else {
            onChartMouseLeave()
        }
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }

  return (
     <Fragment>
        <p className="bar-chart-category-label text-gray-600 text-sm">
            {phase}
        </p>

        <div className="flex items-center justify-between gap-x-2">
            <ResponsiveContainer 
                width="90%" 
                height={20}
                >
                <BarChart
                    data={chartDataArray}
                    layout="vertical"
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    onMouseEnter={(nextState, event) =>
                        onChartMouseEnterOrMove(nextState, event, formatToDollar)
                    }
                    onMouseMove={(nextState, event) =>
                        onChartMouseEnterOrMove(nextState, event, formatToDollar)
                    }
                    onMouseLeave={onChartMouseLeave}
                >
                    <XAxis 
                        type="number" 
                        hide 
                        domain={[0, highestDomainValue]} 
                    />
                    <YAxis 
                        type="category" 
                        hide 
                    />

                    <Bar 
                        dataKey={keyWithHighestValue}
                        stackId="a" 
                        fill={researchAreaByClinicalTrialPhaseColours[keyWithHighestValue as keyof typeof researchAreaByClinicalTrialPhaseColours]}
                        background={{ fill: "#eee" }}
                    />
                    
                    {remainingBarsList.map((key) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={researchAreaByClinicalTrialPhaseColours[key as keyof typeof researchAreaByClinicalTrialPhaseColours]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            <p className='text-xs text-gray-600'>
                {endOfBarValue}
            </p>
        </div>
    </Fragment>

    
  )
}

export default ClinicalTrialsStackedBars

interface ToolTipProps {
    nextState: any
    formatToDollar: boolean
}

function ClinicalTrialsResearchAreasTooltipContent({ nextState, formatToDollar }: ToolTipProps) {
    const total = Object.values(
        nextState.activePayload[0].payload
    ).reduce((sum: number, value) => {
        return typeof value === 'number' ? sum + value : sum
    }, 0)
    
    const formattedTotal = formatToDollar 
        ? dollarValueFormatter(total)
        : total

    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.dataKey,
        value: formatToDollar 
            ? dollarValueFormatter(payload.value) 
            : payload.value 
            ?? 0,
        colour: payload.color,
    }))

    const desiredResearchAreaOrder = [
        "Diagnostics",
        "Therapeutics",
        "Vaccines",
        "Clinical characterisation and management"
    ]

    const orderedItems = desiredResearchAreaOrder.map(label => 
        items.find(({ label: itemLabel }: { label: string }) => 
            itemLabel === label
        )
    )
    
    return <TooltipContent title={`Total: ${formattedTotal}`} items={orderedItems} />
}