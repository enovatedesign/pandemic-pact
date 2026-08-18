import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { JumpCardItem, VisualisationCardDataProps } from "./types"

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

/**
 * Resolves the grants' disease/outbreak-switched card data down to the flat
 * {@link JumpCardItem} shape shared by the JumpCards grid and the ScrollJumpBar.
 */
export const resolveJumpCardItems = (
    cardData: VisualisationCardDataProps[],
    disease?: DiseaseLabel,
): JumpCardItem[] => {
    const cardSwitch: DiseaseLabel = disease ?? 'default'

    return cardData
        .filter(card => card.showCard[cardSwitch as keyof typeof card.showCard])
        .map(card => {
            const showChevron =
                card.showChevron[cardSwitch as keyof typeof card.showChevron]

            return {
                title: card.title,
                summary: card.summary[cardSwitch as keyof typeof card.summary],
                url: showChevron
                    ? card.url[cardSwitch as keyof typeof card.url] ?? null
                    : null,
                image: card.image,
            }
        })
}