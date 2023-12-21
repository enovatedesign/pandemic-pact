import {useContext} from "react"
import {ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import BarChart from "./BarChart"
import ScatterChart from "./ScatterChart"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {GlobalFilterContext} from "../../helpers/filter"
import selectOptions from "../../../data/dist/select-options.json"

export default function GrantsByResearchCategoryCard() {
    const {grants} = useContext(GlobalFilterContext)

    const chartData = selectOptions.ResearchCat.map(function (researchCategory) {
        const grantsWithKnownAmounts = grants
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = grants
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Research Category": researchCategory.label,
            "Number Of Grants With Known Financial Commitments": grantsWithKnownAmounts.length,
            "Number Of Grants With Unspecified Financial Commitments": grantsWithUnspecifiedAmounts.length,
            "Total Number Of Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Known Financial Commitments": moneyCommitted,
        }
    })

    const tabs = [
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart chartData={chartData} />,
        },
        {
            tab: {
                icon: SparklesIcon,
                label: "Scatter",
            },
            content: <ScatterChart chartData={chartData} />,
        },
    ]

    const infoModalContents = (
        <>
            <h3 className="capitalize">Global distribution of funding for research categories</h3>

            <p className="text-brand-grey-500">We developed a classification of research categories with 13 broad categories by expanding &ldquo;A Coordinated Global Research Roadmap: 2019 Novel Coronavirus&rdquo; created by the R&amp;D Blue Print. All collected funding data are summarised and assigned into a broad category.</p>
        </>
    )

    return (
        <VisualisationCard
            grants={grants}
            id="grants-by-research-category"
            title="Global distribution of funding for research categories"
            subtitle="Total number of grants and US dollars committed for research across research categories"
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder."
            infoModalContents={infoModalContents}
            tabs={tabs}
        />
    )
}
