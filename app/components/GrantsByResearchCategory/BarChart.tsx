import {Text, Subtitle} from "@tremor/react"
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
        <div className="grid grid-cols-1">
            {chartData.map((data, index) => (
                <div className="grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)_70px_minmax(0,_1fr)_70px] gap-4" key={index}>
                    <div className="col-span-1 py-3 self-center">
                        <p className="truncate text-sm text-gray-600">{data["Research Category"]}</p>
                    </div>

                    <div className="col-span-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart
                                data={[data]}
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
                                />

                                <Bar
                                    dataKey="Number Of Grants"
                                    fill="#3b82f6"
                                />
                            </RechartBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-span-1 py-3 self-center justify-self-end">
                        <p className="text-sm text-gray-600">{data["Number Of Grants"]}</p>
                    </div>

                    <div className="col-span-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart
                                data={[data]}
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

                                />
                            </RechartBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-span-1 py-3 self-center justify-self-end">
                        <p className="text-sm text-gray-600">{dollarValueFormatter(data["Amount Committed"])}</p>
                    </div>
                </div>
            ))}

            <div className="grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)_70px_minmax(0,_1fr)_70px] gap-4 items-center">
                <div className="col-span-1" />

                <div className="col-span-2 justify-self-end">
                    <Subtitle>Number of projects</Subtitle>
                </div>

                <div className="col-span-2 justify-self-end">
                    <Subtitle>Known amount committed (USD)</Subtitle>
                </div>
            </div>
        </div>
    )
}
