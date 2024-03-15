import { Fragment, useContext, useState, useMemo } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { GlobalFilterContext } from '../../helpers/filters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import {
    researchCategoryColours,
    researchCategoryDimColours,
    researchSubCategoryColours,
    researchSubCategoryDimColours,
} from '../../helpers/colours'
import { BarListData } from '../../helpers/bar-list'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import selectOptions from '../../../data/dist/select-options.json'

interface Props {
    chartData: BarListData
}

export default function BarChart({ chartData }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    )

    if (!selectedCategory) {
        return (
            <ResearchCategoriesBarChart
                chartData={chartData}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    if (selectedCategory === 'all') {
        return (
            <AllSubCategoriesBarChart
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    return (
        <SubCategoryBarChart
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
    )
}

interface BarChartProps {
    chartData: BarListData
    setSelectedCategory: (category: string) => void
}

function ResearchCategoriesBarChart({
    chartData,
    setSelectedCategory,
}: BarChartProps) {
    return (
        <>
            <BarList
                data={chartData}
                brightColours={researchCategoryColours}
                dimColours={researchCategoryDimColours}
            >
                {chartData.map((datum: any, index: number) => (
                    <Fragment key={datum['Category Value']}>
                        <BarListRowHeading>
                            <p className="text-gray-600 text-sm">
                                {datum['Category Label']}
                            </p>

                            <ViewSubCategoryButton
                                label="View sub-categories"
                                subCategoryValue={datum['Category Value']}
                                setSelectedCategory={setSelectedCategory}
                            />
                        </BarListRowHeading>

                        <BarListRow dataIndex={index} />
                    </Fragment>
                ))}
            </BarList>

            <div className="flex justify-end w-full">
                <ViewSubCategoryButton
                    label="View all sub-categories"
                    subCategoryValue="all"
                    setSelectedCategory={setSelectedCategory}
                />
            </div>
        </>
    )
}

interface ViewSubCategoryButtonProps {
    label: string
    subCategoryValue: string
    setSelectedCategory: (category: string) => void
}

function ViewSubCategoryButton({
    label,
    subCategoryValue,
    setSelectedCategory,
}: ViewSubCategoryButtonProps) {
    return (
        <button
            className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled px-3 text-sm bg-primary-lightest text-secondary hover:bg-primary-lighter"
            onClick={() => setSelectedCategory(subCategoryValue)}
        >
            {label}
        </button>
    )
}

interface SubCategoryBarChartProps {
    selectedCategory: string
    setSelectedCategory: (category: string | null) => void
}

function AllSubCategoriesBarChart({
    setSelectedCategory,
}: SubCategoryBarChartProps) {
    return (
        <>
            <BackToCategoriesButton
                label="Viewing All Sub-Categories"
                setSelectedSubChart={setSelectedCategory}
            />
        </>
    )
}

function SubCategoryBarChart({
    selectedCategory,
    setSelectedCategory,
}: SubCategoryBarChartProps) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => {
        return selectOptions.ResearchSubcat.filter(
            ({ parent }: { parent: string }) => parent === selectedCategory
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
    }, [grants, selectedCategory])

    return (
        <>
            <BackToCategoriesButton
                label="Viewing Sub-Categories Of X"
                setSelectedSubChart={setSelectedCategory}
            />

            <BarList
                data={chartData}
                brightColours={researchSubCategoryColours}
                dimColours={researchSubCategoryDimColours}
            >
                {chartData.map((datum: any, index: number) => (
                    <Fragment key={datum['Category Value']}>
                        <BarListRowHeading>
                            <p className="text-gray-600 text-sm">
                                {datum['Category Label']}
                            </p>
                        </BarListRowHeading>

                        <BarListRow dataIndex={index} />
                    </Fragment>
                ))}
            </BarList>
        </>
    )
}

interface BackToCategoriesButtonProps {
    label: string
    setSelectedSubChart: (category: string | null) => void
}

function BackToCategoriesButton({
    label,
    setSelectedSubChart,
}: BackToCategoriesButtonProps) {
    return (
        <div className="flex justify-center items-center w-full">
            <button
                onClick={() => setSelectedSubChart(null)}
                className="flex items-center"
            >
                <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                    <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                </span>
            </button>

            <p className="text-brand-grey-500">{label}</p>
        </div>
    )
}
