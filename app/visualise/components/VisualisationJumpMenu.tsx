import AnimateHeight from "react-animate-height"

import { visualisationCardData, hundredDaysMissionVisualisationCardData } from './visualisationCardData'
import { DiseaseLabel } from "@/app/helpers/types"

import JumpMenu from "@/app/components/JumpMenu"

interface Props {
    isHundredDaysMission?: boolean
    dropdownVisible: boolean
    outbreak: boolean
    disease?: DiseaseLabel
}

const VisualisationJumpMenu = ({ 
    isHundredDaysMission = false, 
    dropdownVisible, 
    outbreak, 
    disease 
}: Props) => {
    const cardSwitch: DiseaseLabel = disease ?? 'default'

    const cardData = isHundredDaysMission ? 
        hundredDaysMissionVisualisationCardData : 
        visualisationCardData(outbreak, disease).filter(card => 
            card.showCard[cardSwitch as keyof typeof card.showCard] && 
            card.showChevron[cardSwitch as keyof typeof card.showChevron]
        )

    return (
        <AnimateHeight
            duration={300}
            height={dropdownVisible ? 'auto' : 0}
            className="sticky w-full z-20 top-0 backdrop-blur-sm bg-primary-lighter/75"
        >
            <JumpMenu cardData={cardData} disease={disease}/>
        </AnimateHeight>
    )
}

export default VisualisationJumpMenu