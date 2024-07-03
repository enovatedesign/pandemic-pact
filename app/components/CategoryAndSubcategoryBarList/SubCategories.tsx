import { Fragment, useContext, useMemo } from 'react'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    getColoursByField,
    prepareBarListDataForCategory,
} from '../../helpers/bar-list'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import BackToParentButton from '../BackToParentButton'
import selectOptions from '../../../data/dist/select-options.json'

interface Props {
    categoryField: string
    subcategoryField: string
    selectedCategory: string
    setSelectedCategory: (category: string | null) => void
}

export default function SubCategories({
    categoryField,
    subcategoryField,
    selectedCategory,
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => {
        const subCategories: any =
            selectOptions[subcategoryField as keyof typeof selectOptions]

        return subCategories
            .filter(
                ({ parent }: { parent: string }) => parent === selectedCategory
            )
            .map((category: any) =>
                prepareBarListDataForCategory(
                    grants,
                    category,
                    subcategoryField
                )
            )
    }, [subcategoryField, grants, selectedCategory])

    const categories =
        selectOptions[categoryField as keyof typeof selectOptions]

    const categoryLabel = categories.find(
        ({ value }: { value: string }) => value === selectedCategory
    )?.label

    const { brightColours, dimColours } = getColoursByField(subcategoryField)

    return (
        <>
            <BackToParentButton
                label={`Viewing Sub-Categories Of ${categoryLabel}`}
                onClick={() => setSelectedCategory(null)}
            />

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
                        </BarListRowHeading>

                        <BarListRow dataIndex={index} />
                    </Fragment>
                ))}
            </BarList>
        </>
    )
}
