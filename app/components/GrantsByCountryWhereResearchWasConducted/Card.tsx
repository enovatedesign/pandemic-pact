import VisualisationCard from "../VisualisationCard"
import {ChartBarIcon, GlobeIcon} from "@heroicons/react/solid"
import Map from "./Map"
import BarChart from "./BarChart"
import {type CardProps} from "../../types/card-props"

export default function GrantsByCountryWhereResearchWasConductedCard({globallyFilteredDataset}: CardProps) {
    const tabs = [
        {
            tab: {
                icon: GlobeIcon,
                label: "Map",
            },
            content: <Map dataset={globallyFilteredDataset} />
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart dataset={globallyFilteredDataset} />
        },
    ]

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-country-where-research-was-conducted"
            title="Global Map Showing Where Research Was Conducted"
            subtitle="Possimus fugit laudantium recusandae. Ducimus rem minima quam consequatur asperiores magni. Earum a illum. "
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
            tabs={tabs}
        />
    )
}
