"use client"

import { useContext, useState, useMemo } from "react"
import { ClockIcon, ChartBarIcon } from "@heroicons/react/outline"
import { groupBy } from "lodash"

import { GlobalFilterContext } from "@/app/helpers/filters"
import { sumNumericGrantAmounts } from "@/app/helpers/reducers"
import { axisDollarFormatter } from "@/app/helpers/value-formatters"

import { AnnualTrendsChartData, AnnualTrendsChartDatum, AxisLabel } from "./types"
import { SelectOption } from "@/scripts/types/generate"

import selectOptions from "../../../../../../data/dist/select-options.json"
import VisualisationCard from "@/app/components/VisualisationCard"
import Lines from "./Lines"
import Bars from "./Bars"
import RadioGroup from "@/app/components/RadioGroup"

const AnnualTrendsByTheme = () => {
    const { grants } = useContext(GlobalFilterContext)
    const [
        displayKnownFinancialCommitments,
        setDisplayKnownFinancialCommitments,
    ] = useState<boolean>(false)

    const themes: SelectOption[] = selectOptions["PandemicIntelligenceThemes"]

    const { chartData } = useMemo(() => {
        const datasetGroupedByYear = groupBy(
            grants.filter(
                (grant: any) =>
                    grant?.TrendStartYear &&
                    !isNaN(grant.TrendStartYear) &&
                    grant.TrendStartYear >= 2020
            ),
            "TrendStartYear"
        )

        const chartData: AnnualTrendsChartData = Object.keys(datasetGroupedByYear).map((year) => {
            const grants = datasetGroupedByYear[year]

            let dataPoint: AnnualTrendsChartDatum = { year }

            themes.forEach(({ value, label }) => {
                const filteredGrants = grants
                    .filter((grant) =>
                        grant["PandemicIntelligenceThemes"].includes(value)
                    )
                    .map((grant) => ({
                        ...grant,
                        GrantAmountConverted: Number(
                            grant.GrantAmountConverted
                        ),
                    }))

                const valueToUse = displayKnownFinancialCommitments
                    ? filteredGrants.reduce(...sumNumericGrantAmounts)
                    : filteredGrants.length

                if (valueToUse > 0) {
                    dataPoint[label] = valueToUse
                }
            })

            return dataPoint
        })

        return {
            chartData,
        }
    }, [displayKnownFinancialCommitments, grants, themes])

    const tickFormatter = (value: any) => displayKnownFinancialCommitments ? 
        axisDollarFormatter(value) : 
        value.toString()

    const yAxisLabel: AxisLabel = {
        value: displayKnownFinancialCommitments
            ? 'Known Financial Commitments (USD)'
            : 'Number of grants',
        position: 'left',
        angle: -90,
        style: { textAnchor: 'middle' },
        offset: 20,
    }
    
    const tabs = [
        {
            tab: {
                icon: ClockIcon,
                label: "Lines",
            },
            content: <Lines 
                chartData={chartData} 
                lines={themes} 
                tickFormatter={tickFormatter}
                displayKnownFinancialCommitments={displayKnownFinancialCommitments}
                yAxisLabel={yAxisLabel}
            />
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <Bars 
                chartData={chartData} 
                bars={themes} 
                tickFormatter={tickFormatter}
                displayKnownFinancialCommitments={displayKnownFinancialCommitments}
                yAxisLabel={yAxisLabel}
            />
        }
    ]

    return (
        <VisualisationCard
            id="annual-trends-in-new-grants-by-theme"
            title="Annual trends in new grants by theme"
            subtitle="The chart shows the total amount of funding allocated to the pandemic and epidemic research priority themes by calendar year of award start date."
            footnote="Please note: Grants may fall under more than one pandemic or epidemic intelligence priority theme. Funding amounts are included only when they have been published by the funder and are included within the year of the grant award start date."
            tabs={tabs}
            filenameToFetch="pandemic-intelligence/pandemic-intelligence-grants.csv"
            filteredFileName='pandemic-intelligence-filtered-grants.csv'
        >
            <div className="w-full flex justify-end ignore-in-image-export">
                <RadioGroup<boolean>
                    options={[
                        { label: 'Number of grants', value: false },
                        {
                            label: 'Known financial commitments (USD)',
                            value: true,
                        },
                    ]}
                    value={displayKnownFinancialCommitments}
                    onChange={setDisplayKnownFinancialCommitments}
                />
            </div>
        </VisualisationCard>
    )
}

export default AnnualTrendsByTheme
