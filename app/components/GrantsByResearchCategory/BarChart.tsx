import CategoryAndSubcategoryBarList from '../CategoryAndSubcategoryBarList/CategoryAndSubcategoryBarList'
import { BarListData } from '../../helpers/bar-list'

interface Props {
    chartData: BarListData
}

export default function BarChart({ chartData }: Props) {
    return (
        <CategoryAndSubcategoryBarList
            categoryField="ResearchCat"
            subcategoryField="ResearchSubcat"
            chartData={chartData}
        />
    )
}
