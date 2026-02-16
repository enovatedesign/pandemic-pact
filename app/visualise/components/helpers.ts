import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { VisualisationCardDataProps } from "./types"

import { 
    hundredDaysMissionJumpCardData, 
    pandemicIntelligenceJumpCardData, 
    visualisationCardData 
} from "./visualisationCardData"

interface Props {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    outbreak?: boolean
    disease?: DiseaseLabel
}

export const getVisualisationCards = ({ outbreak = false, disease, policyRoadmapEntryType }: Props) => {
    const cardSwitch: DiseaseLabel = disease ?? 'default'
    
    let cardData: VisualisationCardDataProps[] = visualisationCardData(outbreak, disease).filter(card => 
        card.showCard[cardSwitch as keyof typeof card.showCard] && 
        card.showChevron[cardSwitch as keyof typeof card.showChevron]
    )

    if (policyRoadmapEntryType) {
        switch (policyRoadmapEntryType) {
            case 'hundredDaysMission':
                cardData = hundredDaysMissionJumpCardData
                break;

            case 'pandemicIntelligence':
                cardData = pandemicIntelligenceJumpCardData
                break;
        
            default:
                cardData = visualisationCardData(outbreak, disease).filter(card => 
                    card.showCard[cardSwitch as keyof typeof card.showCard] && 
                    card.showChevron[cardSwitch as keyof typeof card.showChevron]
                )
                break;
        }
    }

    return cardData
}