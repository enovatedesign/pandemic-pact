import { useContext, useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    GrantAndFinancialCommitmentBarList,
    GrantAndFinancialCommitmentBarListData,
} from '../GrantAndFinancialCommitmentBarList'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import selectOptions from '../../../data/dist/select-options.json'

import {
    researchCategoryColours,
    researchCategoryDimColours,
    researchSubCategoryColours,
    researchSubCategoryDimColours,
} from '../../helpers/colours'

interface Props {
    chartData: GrantAndFinancialCommitmentBarListData
}

export default function BarChart({ chartData }: Props) {
    const [showAllSubCategories, setShowAllSubCategories] = useState(false)

    if (showAllSubCategories) {
        return (
            <>
                <div className="flex justify-center items-center w-full">
                    <button
                        onClick={() => setShowAllSubCategories(false)}
                        className="flex items-center"
                    >
                        <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                            <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                        </span>
                    </button>

                    <p className="text-brand-grey-500">
                        Viewing All Sub-Categories
                    </p>
                </div>

                <AllSubCategoriesBarChart chartData={chartData} />
            </>
        )
    }

    const subCharts = Object.fromEntries(
        chartData.map(data => {
            return [
                data['Category Value'],
                <SubCategoryBarChart
                    key={data['Category Value']}
                    researchCategory={data['Category Value']}
                />,
            ]
        })
    )

    return (
        <>
            <GrantAndFinancialCommitmentBarList
                data={chartData}
                brightColours={researchCategoryColours}
                dimColours={researchCategoryDimColours}
                subCharts={subCharts}
            />

            <div className="flex justify-end w-full">
                <button
                    className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled px-3 text-sm bg-primary-lightest text-secondary hover:bg-primary-lighter"
                    onClick={() => setShowAllSubCategories(true)}
                >
                    View all sub-categories
                </button>
            </div>
        </>
    )
}

function AllSubCategoriesBarChart({ chartData }: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const subCategoryChartData: [string, any][] = chartData.map(
        ({
            'Category Label': researchCategoryLabel,
            'Category Value': researchCategoryValue,
        }) => {
            const researchSubCategoryData = selectOptions.ResearchSubcat.filter(
                ({ parent }: { parent: string }) =>
                    parent === researchCategoryValue
            ).map(function (researchSubCategory) {
                const grantsWithKnownAmounts = grants
                    .filter((grant: any) =>
                        grant.ResearchSubcat.includes(researchSubCategory.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted === 'number'
                    )

                const grantsWithUnspecifiedAmounts = grants
                    .filter((grant: any) =>
                        grant.ResearchSubcat.includes(researchSubCategory.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted !== 'number'
                    )

                const moneyCommitted = grantsWithKnownAmounts.reduce(
                    ...sumNumericGrantAmounts
                )

                return {
                    'Category Value': researchSubCategory.value,
                    'Category Label': researchSubCategory.label,
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

            return [researchCategoryLabel, researchSubCategoryData]
        }
    )

    return (
        <div className="flex flex-col gap-y-6 w-full">
            {subCategoryChartData.map(
                ([researchCategoryLabel, researchSubCategoryData]) => (
                    <div key={researchCategoryLabel}>
                        <h3 className="text-lg mb-2">
                            {researchCategoryLabel}
                        </h3>

                        <GrantAndFinancialCommitmentBarList
                            data={researchSubCategoryData}
                            brightColours={researchSubCategoryColours}
                            dimColours={researchSubCategoryDimColours}
                            showColumnHeadings={false}
                        />
                    </div>
                )
            )}
        </div>
    )
}

function SubCategoryBarChart({
    researchCategory,
}: {
    researchCategory: string
}) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = selectOptions.ResearchSubcat.filter(
        ({ parent }: { parent: string }) => parent === researchCategory
    ).map(function (researchSubCategory) {
        const grantsWithKnownAmounts = grants
            .filter((grant: any) =>
                grant.ResearchSubcat.includes(researchSubCategory.value)
            )
            .filter(
                (grant: any) => typeof grant.GrantAmountConverted === 'number'
            )

        const grantsWithUnspecifiedAmounts = grants
            .filter((grant: any) =>
                grant.ResearchSubcat.includes(researchSubCategory.value)
            )
            .filter(
                (grant: any) => typeof grant.GrantAmountConverted !== 'number'
            )

        const moneyCommitted = grantsWithKnownAmounts.reduce(
            ...sumNumericGrantAmounts
        )

        return {
            'Category Value': researchSubCategory.value,
            'Category Label': researchSubCategory.label,
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

    return (
        <GrantAndFinancialCommitmentBarList
            data={chartData}
            brightColours={researchSubCategoryColours}
            dimColours={researchSubCategoryDimColours}
        />
    )
}
