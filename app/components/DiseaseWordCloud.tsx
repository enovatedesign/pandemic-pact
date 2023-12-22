import {useContext} from "react"
import {GlobalFilterContext} from "../helpers/filter"
import VisualisationCard from "../components/VisualisationCard"
import WordCloud from "../components/WordCloud"
import {diseaseColours} from "../helpers/colours"

export default function DiseaseWordCloud() {
    const {grants} = useContext(GlobalFilterContext)

    return (
        <VisualisationCard
            grants={grants}
            id="disease-word-cloud"
            title="Word cloud showing the funding for infectious diseases with a pandemic potential"
        >
            <div className="w-full">
                <WordCloud
                    filterKey="Disease"
                    randomSeedString="2324234234"
                    colours={diseaseColours}
                />
            </div>

            <p className="text-brand-grey-500">
                The amount of funding is represented by the size of the word
            </p>
        </VisualisationCard>
    )
}
