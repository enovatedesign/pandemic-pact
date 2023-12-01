import {Title, Text} from "@tremor/react"
import {ChartBarIcon, ClockIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import BarChart from "./BarChart"
import TemporalChart from "./TemporalChart"
import {type CardProps} from "../../types/card-props"

export default function GrantsByDisease({globallyFilteredDataset}: CardProps) {
    const tabs = [
        {
            tab: {
                icon: ClockIcon,
                label: "Temporal",
            },
            content: <TemporalChart globallyFilteredDataset={globallyFilteredDataset} />,
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart globallyFilteredDataset={globallyFilteredDataset} />,
        },
    ]

    const infoModalContents = (
        <>
            <Title>Global annual funding for research on diseases with a pandemic potential</Title>

            <Text>The list contains the WHO priority diseases plus pandemic influenza, Mpox and plague</Text>
        </>
    )

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-disease"
            title="Global annual funding for research on diseases with a pandemic potential"
            subtitle="Total number of grants and US dollars committed for each disease"
            footnote="Please note Funding Amounts are included only when they have been published by the funder."
            infoModalContents={infoModalContents}
            tabs={tabs}
        />
    )
}
