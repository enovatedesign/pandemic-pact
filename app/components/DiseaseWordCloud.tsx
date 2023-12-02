import {useContext} from "react"
import {Text} from "@tremor/react"
import {GlobalFilterContext} from "../helpers/filter"
import VisualisationCard from "../components/VisualisationCard"
import WordCloud from "../components/WordCloud"

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
                />
            </div>

            <div>
                <Text>
                    The amount of funding is represented by the size of the word
                </Text>
            </div>
        </VisualisationCard>
    )
}
