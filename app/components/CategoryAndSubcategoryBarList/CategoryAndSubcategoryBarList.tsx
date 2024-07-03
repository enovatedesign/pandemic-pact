import { useState } from 'react'
import { BarListData } from '../../helpers/bar-list'
import ResearchCategoriesBarList from './ResearchCategoriesBarList'
import ResearchSubCategoriesBarList from './ResearchSubCategoriesBarList'
import AllResearchSubCategoriesBarList from './AllResearchSubCategoriesBarList'

interface Props {
    categoryField: string
    subcategoryField: string
    chartData: BarListData
}

export default function CategoryAndSubcategoryBarList({
    categoryField,
    subcategoryField,
    chartData,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    )

    if (!selectedCategory) {
        return (
            <ResearchCategoriesBarList
                categoryField={categoryField}
                chartData={chartData}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    if (selectedCategory === 'all') {
        return (
            <AllResearchSubCategoriesBarList
                categoryField={categoryField}
                subcategoryField={subcategoryField}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    return (
        <ResearchSubCategoriesBarList
            categoryField={categoryField}
            subcategoryField={subcategoryField}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
    )
}
