import {useContext} from "react"
import VisualisationCard from "../VisualisationCard"
import {ChartBarIcon, GlobeIcon} from "@heroicons/react/solid"
import {GlobalFilterContext} from "../../helpers/filter"
import Map from "./Map"
import BarChart from "./BarChart"

export default function GrantsByCountryWhereResearchWasConductedCard() {
    const {grants} = useContext(GlobalFilterContext)

    const tabs = [
        {
            tab: {
                icon: GlobeIcon,
                label: "Map",
            },
            content: <Map />
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart />
        },
    ]

    return (
        <VisualisationCard
            grants={grants}
            id="grants-by-country-where-research-was-conducted"
            title="Global Map Showing Locations of Research Funders or Where Research Will Be Conducted"
            subtitle="The information on the research location was collected where available from the grant application, and can be different to the location of research institution."
            footnote="Please note: Grants may fall under more than one research category, funding amounts are included only when they have been published by the funder and some research projects are undertaken in multiple locations (countries)."
            tabs={tabs}
        />
    )
}
