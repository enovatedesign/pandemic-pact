import { Fragment, MouseEvent } from "react"
import { 
    ResponsiveContainer, 
    BarChart, 
    XAxis, 
    YAxis, 
    Bar 
} from "recharts"

import BackToParentButton from "@/app/components/BackToParentButton"
import { hundredDayMissionStudyPopulationColours } from "@/app/helpers/colours";
import { data } from "autoprefixer";

type SubCategoryData = Record<string, { "Category Label": string; "Total Grants": number }[]>

interface SubCategoryBarsProps {
    subCategoryData: SubCategoryData
    onChartMouseEnterOrMove: (
        nextState: any,
        event: MouseEvent<SVGPathElement>
    ) => void
    onChartMouseLeave: () => void
    activeSubCategory: string | null
    setActiveSubCategory: (category: string | null) => void
}

const SubCategoryBars = ({
    subCategoryData,
    onChartMouseEnterOrMove,
    onChartMouseLeave,
    activeSubCategory,
    setActiveSubCategory
}: SubCategoryBarsProps) => {
    const subCategoryChartData = subCategoryData[activeSubCategory as keyof typeof subCategoryData]

    return subCategoryChartData && subCategoryChartData.length && (
        <div className="w-full space-y-6">
            <BackToParentButton
                label={`Viewing Sub-Categories Of ${activeSubCategory}`}
                onClick={() => setActiveSubCategory(null)}
            />

            <Fragment key={activeSubCategory}>
                <h3 className="text-lg">{activeSubCategory}</h3>

                <div className="w-full space-y-1">
                    {subCategoryChartData.map((dataPoint) => {
                        const { "Category Label": categoryLabel } = dataPoint
                        
                        const highestCountValue = Math.max(
                            ...subCategoryChartData.map((d) => d["Total Grants"])
                        )
                        
                        return (
                            <Fragment key={categoryLabel}>
                                <p className="bar-chart-category-label text-gray-600 text-sm">
                                    {categoryLabel}
                                </p>

                                <div className="flex items-center justify-between">
                                    <ResponsiveContainer
                                        width="95%"
                                        height={20}
                                    >
                                        <BarChart
                                            data={[dataPoint]}
                                            layout="vertical"
                                            margin={{
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                            }}
                                            onMouseEnter={(
                                                nextState,
                                                event
                                            ) =>
                                                onChartMouseEnterOrMove(
                                                    nextState,
                                                    event
                                                )
                                            }
                                            onMouseMove={(
                                                nextState,
                                                event
                                            ) =>
                                                onChartMouseEnterOrMove(
                                                    nextState,
                                                    event
                                                )
                                            }
                                            onMouseLeave={
                                                onChartMouseLeave
                                            }
                                        >
                                            <XAxis
                                                type="number"
                                                hide={true}
                                                domain={[
                                                    0,
                                                    highestCountValue,
                                                ]}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="Category Label"
                                                axisLine={false}
                                                tickLine={false}
                                                hide={true}
                                            />

                                            <Bar
                                                dataKey="Total Grants"
                                                fill={hundredDayMissionStudyPopulationColours[
                                                    activeSubCategory as keyof typeof hundredDayMissionStudyPopulationColours
                                                ][categoryLabel]}
                                                background={{
                                                    fill: "#eee",
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>

                                    <p className="total-grants-number pl-2 text-xs text-gray-600">
                                        {dataPoint["Total Grants"]}
                                    </p>
                                </div>
                            </Fragment>
                        )
                    })}
                </div>
            </Fragment>
        </div>
    )
}

export default SubCategoryBars