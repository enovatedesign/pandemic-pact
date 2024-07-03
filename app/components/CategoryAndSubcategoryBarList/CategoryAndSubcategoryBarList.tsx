import { useState } from 'react'
import Categories from './Categories'
import SubCategories from './SubCategories'
import AllSubCategories from './AllSubCategories'

interface Props {
    categoryField: string
    subcategoryField: string
}

export default function CategoryAndSubcategoryBarList({
    categoryField,
    subcategoryField,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    )

    if (!selectedCategory) {
        return (
            <Categories
                categoryField={categoryField}
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
