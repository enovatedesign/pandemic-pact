import {ChartBarIcon, ClockIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import BarChart from "./BarChart"
import TemporalChart from "./TemporalChart"
import {type CardProps} from "../../types/card-props"

export default function GrantsByDisease({globallyFilteredDataset}: CardProps) {
    const tabs = [
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart globallyFilteredDataset={globallyFilteredDataset} />,
        },
        {
            tab: {
                icon: ClockIcon,
                label: "Temporal",
            },
            content: <TemporalChart globallyFilteredDataset={globallyFilteredDataset} />,
        },
    ]

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-disease"
            title="Global annual funding for research on diseases with a pandemic potential"
            subtitle="Total number of grants and US dollars committed for each disease"
            tabs={tabs}
        />
    )
}
