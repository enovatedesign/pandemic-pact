import {Title, Text} from "@tremor/react"
import {ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import BarChart from "./BarChart"
import ScatterChart from "./ScatterChart"
import {type CardProps} from "../../types/card-props"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import selectOptions from "../../../data/dist/select-options.json"

export default function GrantsByResearchCategoryCard({globallyFilteredDataset}: CardProps) {
    const researchCategoryOptions = selectOptions.ResearchCat

    const chartData = researchCategoryOptions.map(function (researchCategory) {
        const grantsWithKnownAmounts = globallyFilteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = globallyFilteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Research Category": researchCategory.label,
            "Number Of Grants With Known Amount Committed": grantsWithKnownAmounts.length,
            "Number Of Grants With Unspecified Amount Committed": grantsWithUnspecifiedAmounts.length,
            "Total Number Of Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Amount Committed": moneyCommitted,
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
            <Title>Lorem Ipsum Dolor</Title>

            <Text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Molestiae in, eligendi odio animi distinctio laborum exercitationem, illo deleniti sit sunt nemo doloremque. Nemo reprehenderit inventore magni eligendi nam architecto sint!</Text>
        </>
    )

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-research-category"
            title="Grants By Research Category"
            subtitle="Magni reprehenderit architecto eligendi id sint repudiandae dolore aperiam. Tenetur sint nemo hic iusto. A corporis aliquam magni nemo harum iusto."
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
            infoModalContents={infoModalContents}
            tabs={tabs}
        />
    )
}
