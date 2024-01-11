import WordCloud from "../WordCloud"
import {diseaseColours} from "../../helpers/colours"

export default function DiseaseWordCloud() {
    return (
        <div className="w-full">
            <WordCloud
                filterKey="Disease"
                randomSeedString="2324234234"
                colours={diseaseColours}
            />
        </div>
    )
}
