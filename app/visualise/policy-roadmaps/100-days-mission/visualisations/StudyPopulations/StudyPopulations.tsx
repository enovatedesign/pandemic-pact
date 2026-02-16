import { useContext, useMemo, MouseEvent, useState } from "react"
import { sumBy, uniq } from "lodash"

import selectOptions from "../../../../../../data/dist/select-options.json"

import { GlobalFilterContext } from "@/app/helpers/filters"
import { TooltipContext } from "@/app/helpers/tooltip"

import VisualisationCard from "@/app/components/VisualisationCard"
import TooltipContent from "@/app/components/TooltipContent"
import CategoryBars from "./CategoryBars"
import SubCategoryBars from "./SubCategoryBars"
import Switch from "@/app/components/Switch"

const countGrantsRelatedToField = (grants: any[], field: string) => {
    const options = selectOptions[field as keyof typeof selectOptions]

    return options.map(({ value, label }) => ({
        "Category Label": label,
        "Total Grants": uniq(
            grants.filter((grant) => grant[field].includes(value))
        ).length,
    })).sort((a, b) =>
        b["Total Grants"] - a["Total Grants"]
    )
}

const StudyPopulations = () => {
    const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)
    const [hideUnspecified, setHideUnspecified] = useState<boolean>(false)

    const { grants } = useContext(GlobalFilterContext)
    const { tooltipRef } = useContext(TooltipContext)

    const { categoryData, subCategoryData } = useMemo(() => {
        const labels = [
            "Age Groups",
            "Vulnerable Populations",
            "Rurality",
            "Occupational Groups",
            "Ethnicity",
        ]

        let subCategoryData = Object.fromEntries(
            labels.map((label) => {
                return [
                    label,
                    countGrantsRelatedToField(grants, label.replace(" ", "")),
                ]
            })
        )
        if (hideUnspecified) {
            subCategoryData = Object.fromEntries(
                Object.entries(subCategoryData).map(([key, data]) => [
                    key,
                    data.filter(d => d['Category Label'] !== 'Unspecified')
                ])
            )
        }
        
        const categoryData = Object.fromEntries(
            Object.entries(subCategoryData).map(([categoryLabel, data]) => [
                categoryLabel,
                {
                    subCategoryData: data,
                    "Total Grants": sumBy(data, "Total Grants"),
                },
            ])
        )
        
        
        return {
            categoryData,
            subCategoryData,
        }
    }, [grants, hideUnspecified])

    const onChartMouseEnterOrMove = (
        nextState: any,
        event: MouseEvent<SVGPathElement>
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <BarsTooltipContent nextState={nextState} />,
            })
        } else {
            onChartMouseLeave()
        }
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }
    
    return (
        <VisualisationCard
            id="distribution-of-clinical-research-grants-by-study-populations"
            title="Distribution of Research Grants by Study Populations"
            footnote="Please note: Grants may include more than one study population. Study populations involved in research are as mentioned in grant information."
            filenameToFetch='100-days-mission/100-days-mission-grants.csv'
            filteredFileName='100-days-mission-filtered-grants.csv'
        >
            <Switch
                checked={hideUnspecified}
                onChange={setHideUnspecified}
                label="Hide Unspecified"
                theme="light"
            />

            <CategoryBars 
                categoryData={categoryData} 
                activeSubCategory={activeSubCategory}
                setActiveSubCategory={setActiveSubCategory} 
                onChartMouseEnterOrMove={onChartMouseEnterOrMove} 
                onChartMouseLeave={onChartMouseLeave}
            />

            <SubCategoryBars
                subCategoryData={subCategoryData}
                onChartMouseEnterOrMove={onChartMouseEnterOrMove}
                onChartMouseLeave={onChartMouseLeave}
                activeSubCategory={activeSubCategory} 
                setActiveSubCategory={setActiveSubCategory}
            />
        </VisualisationCard>
    )
}

export default StudyPopulations

const BarsTooltipContent = ({ nextState }: any) => {
    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.name,
        value: payload.value,
        colour: payload.color,
    }))

    return <TooltipContent items={items} />
}