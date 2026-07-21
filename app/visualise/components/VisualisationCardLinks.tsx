import {ChevronDownIcon} from "@heroicons/react/solid"

import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { getVisualisationCards } from "./helpers"

import Card from "../../components/ContentBuilder/Common/Card"
import VisualisationCardGrid from "../../components/VisualisationCardGrid"

interface VisualisationCardLinksProps {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    outbreak?: boolean
    disease?: DiseaseLabel
}

const VisualisationCardLinks = ({ policyRoadmapEntryType = null, outbreak = false, disease }: VisualisationCardLinksProps) => {
    const cardData = getVisualisationCards({ policyRoadmapEntryType, outbreak, disease });

    
    return cardData.length > 0 && (
        <VisualisationCardGrid>
            {cardData.map((card, index) => {
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
        </VisualisationCardGrid>
    )
}

export default VisualisationCardLinks