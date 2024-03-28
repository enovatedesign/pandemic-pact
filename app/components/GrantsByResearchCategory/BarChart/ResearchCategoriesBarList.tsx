import { Fragment } from 'react'
import { BarListData } from '../../../helpers/bar-list'
import BarList from '../../BarList/BarList'
import BarListRow from '../../BarList/BarListRow'
import BarListRowHeading from '../../BarList/BarListRowHeading'
import {
    researchCategoryColours,
    researchCategoryDimColours,
} from '../../../helpers/colours'

interface Props {
    chartData: BarListData
    setSelectedCategory: (category: string) => void
}

export default function ResearchCategoriesBarList({
    chartData,
    setSelectedCategory,
}: Props) {
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
                            <p className="bar-chart-title text-gray-600 text-sm">
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
                    customClasses='px-4 py-1 lg:text-base uppercase text-white bg-secondary hover:bg-secondary-lighter'
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
    customClasses
}: ViewSubCategoryButtonProps) {

    const handleClick = (e: any) => {
        location.href="#research-category"
        setSelectedCategory(subCategoryValue)
    }

    return (
        <button
            className={`self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm ${customClasses ? customClasses : 'px-3 bg-primary hover:bg-primary-lighter text-secondary'} ignore-in-image-export`}
            onClick={handleClick}
        >
            {label}
        </button>
    )
}
