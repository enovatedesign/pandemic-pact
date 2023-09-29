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
            "Research Category": researchCategory.label,
            "Number Of Grants": numberOfGrants,
            "Amount Committed": moneyCommitted,
        }
    })

    return (
        <div className=" w-full h-[800px] flex justify-between gap-x-4">
            <ResponsiveContainer width="33%" height="100%">
                <RechartBarChart
                    data={chartData}
                    layout="vertical"
                >
                    <XAxis
                        type="number"
                        hide={true}
                    />

                    <YAxis
                        type="category"
                        dataKey="Research Category"
                        axisLine={false}
                        tickLine={false}
                        width={400}
                    />
                </RechartBarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="33%" height="100%">
                <RechartBarChart
                    data={chartData}
                    layout="vertical"
                >
                    <XAxis
                        type="number"
                        hide={true}
                    />

                    <YAxis
                        type="category"
                        dataKey="Research Category"
                        hide={true}
                    />

                    <Tooltip
                        wrapperStyle={{zIndex: 99}}
                    />

                    <Bar
                        dataKey="Number Of Grants"
                        fill="#3b82f6"
                        barSize={40}
                        label={{position: 'right'}}
                    />
                </RechartBarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="33%" height="100%">
                <RechartBarChart
                    data={chartData}
                    layout="vertical"
                >
                    <XAxis
                        type="number"
                        hide={true}
                    />

                    <YAxis
                        type="category"
                        dataKey="Research Category"
                        axisLine={false}
                        tickLine={false}
                        hide={true}
                    />

                    <Tooltip
                        wrapperStyle={{zIndex: 99}}
                        formatter={dollarValueFormatter}
                    />

                    <Bar
                        dataKey="Amount Committed"
                        fill="#3b82f6"
                        barSize={40}
                        label={{position: 'right', formatter: dollarValueFormatter}}
                    />
                </RechartBarChart>
            </ResponsiveContainer>
        </div>
    )
}
