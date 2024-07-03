import { useState } from 'react'
import { BarListData } from '../../helpers/bar-list'
import Categories from './Categories'
import SubCategories from './SubCategories'
import AllSubCategories from './AllSubCategories'

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
            <Categories
                categoryField={categoryField}
                chartData={chartData}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    if (selectedCategory === 'all') {
        return (
            <AllSubCategories
                categoryField={categoryField}
                subcategoryField={subcategoryField}
                setSelectedCategory={setSelectedCategory}
            />
        )
    }

    return (
        <SubCategories
            categoryField={categoryField}
            subcategoryField={subcategoryField}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
    )
}
