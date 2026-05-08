import { dollarValueFormatter } from "@/app/helpers/value-formatters"
import { ClinicalTrialsBarList } from "./helpers"

import ClinicalTrialsStackedBars from "./ClinicalTrialsStackedBars"
import InfoModal from "@/app/components/InfoModal"

export type ResearchAreasByClinicalTrialPhase = {
  [key: string]: ClinicalTrialsBarList
}

export type Props = {
    chartData: {
        phase: string
        researchAreasByClinicalTrialPhase: ResearchAreasByClinicalTrialPhase
        totalGrants: number
        totalAmountCommitted: number
    }[]
}

const ClinicalTrialPhases = ({ chartData }: Props) => {
    const highestValueTotalGrants = Math.max(...chartData.map(data => data['totalGrants']))
    const highestTotalAmountCommitted = Math.max(...chartData.map(data => data['totalAmountCommitted']))
    
    
    const calculateChartDataArray = (data: ResearchAreasByClinicalTrialPhase, field: string ) => {
        return [Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, value[field as keyof typeof value]])
        )]
    }

    const calculateKeyWithHighestValue = (obj: Record<string, number>) => {
        return Object.entries(obj).reduce((a, b) => 
            a[1] > b[1] ? a : b
        )[0]
    }
    
    const calculateRemainingBarsList = (
        data: ResearchAreasByClinicalTrialPhase,
        keyToSortBy: keyof ClinicalTrialsBarList,
        keyToOmit: string
    ): string[] => {
        return Object.entries(data)
            .sort((a, b) => b[1][keyToSortBy] - a[1][keyToSortBy])
            .filter(([key]) => key !== keyToOmit)
            .map(([key]) => key)
    }

    return (
        <div className="w-full relative">
            <div className="w-full grid md:grid-cols-2 gap-6">
                <div>
                    <p className="text-right text-brand-grey-500">
                        Number of grants
                    </p>
                    <ul className="w-full flex flex-col gap-y-2">
                        {chartData.map(({ phase, totalGrants, researchAreasByClinicalTrialPhase }) => {
                            const chartDataArray = calculateChartDataArray(researchAreasByClinicalTrialPhase, 'Total Grants')
                            const keyWithHighestValue = calculateKeyWithHighestValue(chartDataArray[0])
                            const remainingBarsList = calculateRemainingBarsList(researchAreasByClinicalTrialPhase, 'Total Grants', keyWithHighestValue)

                            return (
                                <li key={phase} className="space-y-2">
                                    <ClinicalTrialsStackedBars
                                        phase={phase}
                                        chartDataArray={chartDataArray} 
                                        highestDomainValue={highestValueTotalGrants} 
                                        keyWithHighestValue={keyWithHighestValue} 
                                        remainingBarsList={remainingBarsList}
                                        endOfBarValue={totalGrants}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </div>
                
                <div>
                    <div className="flex justify-end gap-x-1">
                        <p className="text-brand-grey-500">
                            Known Financial Commitments (USD)
                        </p>
                        <InfoModal>
                            <p>
                                We used historical currency exchange rates from
                                any currency in which the grant was awarded
                                converted to the US dollar. The term ‘known’ is
                                used as not all grant records have funding
                                amount data.
                            </p>
                        </InfoModal>
                    </div>
                    <ul className="w-full flex flex-col gap-y-2">
                        {chartData.map(({ phase, totalAmountCommitted, researchAreasByClinicalTrialPhase }) => {
                            const chartDataArray = calculateChartDataArray(researchAreasByClinicalTrialPhase, 'Known Financial Commitments (USD)')
                            const keyWithHighestValue = calculateKeyWithHighestValue(chartDataArray[0])
                            const remainingBarsList = calculateRemainingBarsList(researchAreasByClinicalTrialPhase, 'Known Financial Commitments (USD)', keyWithHighestValue)

                            return (
                                <li key={phase} className="space-y-2">
                                    <ClinicalTrialsStackedBars 
                                        key={phase}
                                        phase={phase}
                                        chartDataArray={chartDataArray} 
                                        highestDomainValue={highestTotalAmountCommitted} 
                                        keyWithHighestValue={keyWithHighestValue} 
                                        remainingBarsList={remainingBarsList}
                                        endOfBarValue={dollarValueFormatter(totalAmountCommitted)}
                                        formatToDollar={true}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ClinicalTrialPhases

