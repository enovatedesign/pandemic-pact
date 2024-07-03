import { Fragment } from 'react'
import { getColoursByField, BarListData } from '../../helpers/bar-list'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'

interface Props {
    categoryField: string
    chartData: BarListData
    setSelectedCategory: (category: string) => void
}

export default function ResearchCategoriesBarList({
    categoryField,
    chartData,
    setSelectedCategory,
}: Props) {
    const { brightColours, dimColours } = getColoursByField(categoryField)

    return (
        <>
            <BarList
                data={chartData}
                brightColours={brightColours}
                dimColours={dimColours}
            >
                {chartData.map((datum: any, index: number) => (
                    <Fragment key={datum['Category Value']}>
                        <BarListRowHeading>
                            <p className="bar-chart-category-label text-gray-600 text-sm">
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
                    customClasses="px-4 py-1 lg:text-base uppercase text-white bg-secondary hover:bg-secondary-lighter"
                />
            </div>
        </>
    )
}

interface ViewSubCategoryButtonProps {
    label: string
    subCategoryValue: string
    setSelectedCategory: (category: string) => void
    customClasses?: string
}

function ViewSubCategoryButton({
    label,
    subCategoryValue,
    setSelectedCategory,
    customClasses,
}: ViewSubCategoryButtonProps) {
    const handleClick = () => {
        location.href = '#research-category'
        setSelectedCategory(subCategoryValue)
    }

    return (
        <button
            className={`self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm ${
                customClasses
                    ? customClasses
                    : 'px-3 bg-primary hover:bg-primary-lighter text-secondary'
            } ignore-in-image-export`}
            onClick={handleClick}
        >
            {label}
        </button>
    )
}
