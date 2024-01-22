import {useContext} from "react"
import {BeakerIcon, ExclamationCircleIcon} from "@heroicons/react/solid"
import VisualisationCard from "../VisualisationCard"
import DiseaseWordCloud from "./Disease"
import PathogenWordCloud from "./Pathogen"
import {GlobalFilterContext} from "../../helpers/filter"

export default function WordCloudsCard() {
    const {grants} = useContext(GlobalFilterContext)

    const tabs = [
        {
            tab: {
                icon: BeakerIcon,
                label: "Infectious Diseases",
            },
            content: <DiseaseWordCloud />,
        },
        {
            tab: {
                icon: ExclamationCircleIcon,
                label: "Priority Pathogens",
            },
            content: <PathogenWordCloud />,
        },
    ]

    return (
        <VisualisationCard
            grants={grants}
            id="word-clouds"
            title="Word Clouds"
            footnote="The amount of funding is represented by the size of the word"
            tabs={tabs}
            tabPrefixLabel="Funding for:"
        />
    )
}
