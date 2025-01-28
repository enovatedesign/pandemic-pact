import { useContext, useMemo, Fragment } from 'react'

import {
    getColoursByField,
    isChartDataUnavailable,
    prepareBarListDataForCategory,
} from '../../helpers/bar-list'
import { GlobalFilterContext } from '../../helpers/filters'
import { grantsByResearchCategoriesFallbackData } from '../NoData/visualisationFallbackData'

import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import selectOptions from '../../../data/dist/select-options.json'
import ViewSubCategoryButton from './ViewAllSubCategoriesButton'
import NoDataText from '../NoData/NoDataText'

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

    const { categoriesAndSubCategoriesFallback } = grantsByResearchCategoriesFallbackData

    const categories = selectOptions[categoryField as keyof typeof selectOptions]

    let chartData = useMemo(
        () =>
            categories.map(category =>
                prepareBarListDataForCategory(grants, category, categoryField),
            ),
        [grants, categories, categoryField],
    )
    
    const chartDataIsNotAvailable = isChartDataUnavailable(chartData)
    
    if (chartDataIsNotAvailable) chartData = categoriesAndSubCategoriesFallback
    
    return (
        <>  
            <div className="w-full relative">
                <div className={`w-full ${chartDataIsNotAvailable ? 'blur-md' : ''}`}>
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
                </div>
    
                {chartDataIsNotAvailable && <NoDataText/>}
            </div>

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
