import CategoryAndSubcategoryBarList from "../CategoryAndSubcategoryBarList/CategoryAndSubcategoryBarList"

interface BarChartProps {
    topOfCardId: string
    categoryField: string
    subcategoryField: string
}

const BarChart = ({
    topOfCardId,
    categoryField,
    subcategoryField
}: BarChartProps) => {
    return (
        <CategoryAndSubcategoryBarList
            topOfCardId={topOfCardId}
            categoryField={categoryField}
            subcategoryField={subcategoryField}
        />
    )
}

export default BarChart