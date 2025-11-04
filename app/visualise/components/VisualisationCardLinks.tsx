import Card from "../../components/ContentBuilder/Common/Card"
import {ChevronDownIcon} from "@heroicons/react/solid"
import { visualisationCardData, hundredDaysMissionVisualisationCardData } from './visualisationCardData'
import { DiseaseLabel } from "@/app/helpers/types"

interface VisualisationCardLinksProps {
    isHundredDaysMission?: boolean
    outbreak?: boolean
    disease?: DiseaseLabel
}

const VisualisationCardLinks = ({ isHundredDaysMission = false, outbreak = false, disease }: VisualisationCardLinksProps) => {
    
    const cardSwitch: DiseaseLabel = disease ?? 'default'

    const cards = isHundredDaysMission ?
        hundredDaysMissionVisualisationCardData :
        visualisationCardData(outbreak ,disease).filter(
            card => card.showCard[cardSwitch]
        )

    return (
        <section className="hidden lg:block container mx-auto my-6 lg:my-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {cards.map((card, index) => {
                    const cardSwitch = disease ?? "default";
                    
                    const showChevron = card.showChevron[cardSwitch as keyof typeof card.showChevron]
                    
                    const entry = {
                        title: card.title,
                        summary: card.summary[cardSwitch as keyof typeof card.showChevron],
                        url: showChevron ? card.url[cardSwitch as keyof typeof card.showChevron] : null,
                    }
                    
                    return card.showCard[cardSwitch as keyof typeof card.showCard] && (
                        <Card
                            key={index}
                            entry={entry}
                            tags={false}
                            image={card.image}
                            animatedIcon={showChevron && <ChevronDownIcon className="w-6 h-6" />}
                        />   
                    )
                })}
            </div>
        </section>
    )
}

export default VisualisationCardLinks