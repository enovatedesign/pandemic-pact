import { useState } from 'react'
import { BarListData } from '../../helpers/bar-list'
import ResearchCategoriesBarList from './ResearchCategoriesBarList'
import ResearchSubCategoriesBarList from './ResearchSubCategoriesBarList'
import AllResearchSubCategoriesBarList from './AllResearchSubCategoriesBarList'

interface Props {
    chartData: BarListData
}

export default function CategoryAndSubcategoryBarList({ chartData }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    )

    if (!selectedCategory) {
        return (
            <ResearchCategoriesBarList
                chartData={chartData}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    if (selectedCategory === 'all') {
        return (
            <AllResearchSubCategoriesBarList
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    return (
        <ResearchSubCategoriesBarList
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
    )
}
