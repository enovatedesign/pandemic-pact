import { useContext, useMemo, Fragment } from 'react'
import {
    getColoursByField,
    prepareBarListDataForCategory,
} from '../../helpers/bar-list'
import { GlobalFilterContext } from '../../helpers/filters'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import selectOptions from '../../../data/dist/select-options.json'

interface Props {
    topOfCardId: string
    categoryField: string
    setSelectedCategory: (category: string) => void
}

export default function Categories({
    topOfCardId,
    categoryField,
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const { brightColours, dimColours } = getColoursByField(categoryField)

    const categories = selectOptions[categoryField as keyof typeof selectOptions]
    
    const chartData = useMemo(
        () =>
            categories.map(category =>
                prepareBarListDataForCategory(grants, category, categoryField),
            ),
        [grants, categories, categoryField],
    )
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
                                topOfCardId={topOfCardId}
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
                    topOfCardId={topOfCardId}
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
    topOfCardId: string
    label: string
    subCategoryValue: string
    setSelectedCategory: (category: string) => void
    customClasses?: string
}

function ViewSubCategoryButton({
    topOfCardId,
    label,
    subCategoryValue,
    setSelectedCategory,
    customClasses,
}: ViewSubCategoryButtonProps) {
    const handleClick = () => {
        location.href = `#${topOfCardId}`

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