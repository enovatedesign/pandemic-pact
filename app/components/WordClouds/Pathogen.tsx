import WordCloud from "../WordCloud"
import {pathogenColours} from "../../helpers/colours"

export default function PathogenWordCloud() {
    return (
        <div className="w-full">
            <WordCloud
                filterKey="Pathogen"
                randomSeedString="2324234234"
                colours={pathogenColours}
            />
        </div>
    )
}
