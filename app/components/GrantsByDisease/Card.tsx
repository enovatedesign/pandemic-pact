import {useContext} from "react"
import {ChartBarIcon, ClockIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import BarChart from "./BarChart"
import TemporalChart from "./TemporalChart"
import {GlobalFilterContext} from "../../helpers/filter"

export default function GrantsByDisease() {
    const {grants} = useContext(GlobalFilterContext)

    const tabs = [
        {
            tab: {
                icon: ClockIcon,
                label: "Temporal",
            },
            content: <TemporalChart />,
        },
        {
            tab: {
                icon: ChartBarIcon,
                label: "Bars",
            },
            content: <BarChart />,
        },
    ]

    const infoModalContents = (
        <>
            <h3>Global annual funding for research on diseases with a pandemic potential</h3>

            <p className="text-brand-grey-500">The list contains the WHO priority diseases plus pandemic influenza, Mpox and plague</p>
        </>
    )

    return (
        <VisualisationCard
            grants={grants}
            id="grants-by-disease"
            title="Global annual funding for research on diseases with a pandemic potential"
            subtitle="Total number of grants and US dollars committed for each disease"
            footnote="Please note: Funding amounts are included only when they have been published by the funder."
            infoModalContents={infoModalContents}
            tabs={tabs}
        />
    )
}
