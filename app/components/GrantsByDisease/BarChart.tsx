import { Fragment, useContext, useMemo, useState } from 'react'

import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'

import { diseaseColours, diseaseDimColours } from '../../helpers/colours'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import Switch from '../Switch'
import RadioGroup from '../RadioGroup'
import NoDataText from '../NoData/NoDataText'
import { grantsByDiseaseFallbackData } from '../NoData/visualisationFallbackData'

interface BarChartProps {
    outbreak?: boolean
}

export default function BarChart({outbreak}: BarChartProps) {
    const [hideCovid, setHideCovid] = useState(false)

    const { barsFallback } = grantsByDiseaseFallbackData

    const [
        sortByKnownFinancialCommitments,
        setSortByKnownFinancialCommitments,
    ] = useState(false)

    const orderSortingValue = sortByKnownFinancialCommitments
        ? 'Known Financial Commitments (USD)'
        : 'Total Grants'

    const { grants } = useContext(GlobalFilterContext)

    let chartData = useMemo(() => {
        const diseases = selectOptions.Diseases.filter(
            disease => !hideCovid || disease.label !== 'COVID-19'
        )

        return diseases
            .map(function (disease) {
                const grantsWithKnownAmounts = grants
                    .filter((grant: any) =>
                        grant.Diseases.includes(disease.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted === 'number'
                    )
                const grantsWithUnspecifiedAmounts = grants
                    .filter((grant: any) =>
                        grant.Diseases.includes(disease.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted !== 'number'
                    )

                const moneyCommitted = grantsWithKnownAmounts.reduce(
                    ...sumNumericGrantAmounts
                )

                return {
                    'Category Label': disease.label,
                    'Category Value': disease.value,
                    'Grants With Known Financial Commitments':
                        grantsWithKnownAmounts.length,
                    'Grants With Unspecified Financial Commitments':
                        grantsWithUnspecifiedAmounts.length,
                    'Total Grants':
                        grantsWithKnownAmounts.length +
                        grantsWithUnspecifiedAmounts.length,
                    'Known Financial Commitments (USD)': moneyCommitted,
                }
            })
            .filter(disease => disease['Total Grants'] > 0)
            .filter(disease => 
                disease['Category Label'] !== 'Unspecified' && 
                disease['Category Label'] !== 'Other'
            )
            .sort((a, b) => b[orderSortingValue] - a[orderSortingValue])
    }, [grants, hideCovid, orderSortingValue])
    
    if (chartData.length === 0) chartData = barsFallback
    
    const controlsWrapperClasses = [
        'w-full flex flex-col gap-y-2 lg:gap-y-0 lg:flex-row lg:justify-between items-center ignore-in-image-export',
        chartData === barsFallback && 'blur-md'
    ].filter(Boolean).join(' ')

    const barsWrapperClasses = [
        'z-10 w-full',
         chartData === barsFallback && 'blur-md'
    ].filter(Boolean).join(' ')

    return (
        <>
            <div className={controlsWrapperClasses}>
                {!outbreak && (
                    <Switch
                        checked={hideCovid}
                        onChange={setHideCovid}
                        label="Hide COVID-19"
                        theme="light"
                    />
                )}

                <RadioGroup<boolean>
                    legend="Sort By:"
                    options={[
                        { label: 'Number of grants', value: false },
                        {
                            label: 'Known financial commitments (USD)',
                            value: true,
                        },
                    ]}
                    value={sortByKnownFinancialCommitments}
                    onChange={setSortByKnownFinancialCommitments}
                />
            </div>
            
            <div className={barsWrapperClasses}>
                <BarList
                    data={chartData}
                    brightColours={diseaseColours}
                    dimColours={diseaseDimColours}
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
            
            {chartData === barsFallback && <NoDataText/>}
        </>
    )
    
}
