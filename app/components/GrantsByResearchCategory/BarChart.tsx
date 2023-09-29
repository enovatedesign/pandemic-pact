import {BarChart as RechartBarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {type CardProps} from "../../types/card-props"
import {filterGrants} from "../../helpers/filter"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {dollarValueFormatter} from "../../helpers/value-formatters"
import dataset from "../../../data/dist/filterable-dataset.json"
import selectOptions from "../../../data/dist/select-options.json"

export default function BarChart({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const researchCategoryOptions = selectOptions.ResearchCat

    const numberOfGrantsPerResearchCategory = researchCategoryOptions.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .length

        return {
            key: `grants-per-category-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneyCommittedPerResearchCategory = researchCategoryOptions.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .reduce(...sumNumericGrantAmounts)

        return {
            key: `grant-amount-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const chartData = researchCategoryOptions.map(function (researchCategory, index) {
        const numberOfGrants = numberOfGrantsPerResearchCategory[index].value;
        const moneyCommitted = amountOfMoneyCommittedPerResearchCategory[index].value;

        return {
            "name": researchCategory.label,
            "n": numberOfGrants,
        }
    })

    // TODO work out why ResponsiveContainer is not working
    return (
        <RechartBarChart
            width={800}
            height={600}
            layout="vertical"
            data={chartData}
        >
            <Tooltip />

            <Bar
                dataKey="n"
                fill="#8884d8"
            />
        </RechartBarChart>
    )
}
