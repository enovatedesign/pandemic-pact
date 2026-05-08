import { hundredDayMissionStudyPopulationColours } from "@/app/helpers/colours";
import { Fragment, MouseEvent } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface CategoryBarsProps {
    categoryData: Record<string, { subCategoryData: any[]; "Total Grants": number }>
    activeSubCategory: string | null
    setActiveSubCategory: (category: string) => void
    onChartMouseEnterOrMove: (
        nextState: any,
        event: MouseEvent<SVGPathElement>
    ) => void
    onChartMouseLeave: () => void
}

const CategoryBars = ({
    categoryData,
    activeSubCategory,
    setActiveSubCategory,
    onChartMouseEnterOrMove,
    onChartMouseLeave,  
}: CategoryBarsProps) => {
    
    return !activeSubCategory && (
        <div className="w-full space-y-2">
            {Object.entries(categoryData).map(([ categoryLabel, categoryData ]) => {
                const { subCategoryData, "Total Grants": totalGrants } = categoryData

                const highestCountValue = Math.max(
                    ...subCategoryData.map((d) => d["Total Grants"])
                )
                
                const stackedDatum = subCategoryData.reduce<Record<string, number>>((acc, { 
                    "Category Label": label, 
                    "Total Grants": count 
                }) => {
                    acc[label] = count
                    return acc
                }, {})

                return (
                    <Fragment key={categoryLabel}>
                        <div className="flex items-center justify-between">
                            <h3>{categoryLabel}</h3>

                            <button
                                className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm px-3 bg-primary hover:bg-primary-lighter text-secondary ignore-in-image-export"
                                onClick={() => setActiveSubCategory(categoryLabel)}
                            >
                                View Breakdown
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <ResponsiveContainer 
                                width="95%" 
                                height={20}
                            >
                                <BarChart
                                    data={[stackedDatum]}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                    onMouseEnter={(nextState, event) =>
                                        onChartMouseEnterOrMove(nextState, event)
                                    }
                                    onMouseMove={(nextState, event) =>
                                        onChartMouseEnterOrMove(nextState, event)
                                    }
                                    onMouseLeave={onChartMouseLeave}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, highestCountValue]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="Category Label"
                                        axisLine={false}
                                        tickLine={false}
                                        hide={true}
                                    />

                                    {subCategoryData.map((subCategory) => (
                                        <Bar
                                            key={subCategory["Category Label"]}
                                            dataKey={subCategory["Category Label"]}
                                            stackId="a"
                                            fill={hundredDayMissionStudyPopulationColours[
                                                categoryLabel as keyof typeof hundredDayMissionStudyPopulationColours
                                            ][subCategory["Category Label"]]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                            
                            <p className="total-grants-number pl-2 text-xs text-gray-600">
                                {totalGrants}
                            </p>
                        </div>
                    </Fragment>
                )}
            )}
        </div>
    )
}

export default CategoryBars