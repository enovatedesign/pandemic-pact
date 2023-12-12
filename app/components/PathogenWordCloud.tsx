import {useContext} from "react"
import {GlobalFilterContext} from "../helpers/filter"
import VisualisationCard from "../components/VisualisationCard"
import WordCloud from "../components/WordCloud"

export default function PathogenWordCloud() {
    const {grants} = useContext(GlobalFilterContext)

    return (
        <VisualisationCard
            grants={grants}
            id="pathogen-word-cloud"
            title="Word cloud showing the funding for priority pathogens"
        >
            <div className="w-full">
                <WordCloud
                    filterKey="Pathogen"
                    randomSeedString="2324234234"
                />
            </div>

            <p className="text-brand-grey-500">
                The amount of funding is represented by the size of the word
            </p>
        </VisualisationCard>
    )
}
