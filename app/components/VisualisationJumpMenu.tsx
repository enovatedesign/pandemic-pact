import AnimateHeight from "react-animate-height"

import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { getVisualisationCards } from "../visualise/components/helpers"

import JumpMenu from "@/app/components/JumpMenu"

interface Props {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    dropdownVisible: boolean
    cardData?: any[]
    outbreak?: boolean
    disease?: DiseaseLabel
    useCardSwitch?: boolean
}

const VisualisationJumpMenu = ({ 
    policyRoadmapEntryType = null, 
    dropdownVisible, 
    outbreak = false, 
    disease,
    useCardSwitch = true
}: Props) => {
    const cardData = getVisualisationCards({ policyRoadmapEntryType, outbreak, disease });

    return cardData.length > 0 && (
        <AnimateHeight
            duration={300}
            height={dropdownVisible ? 'auto' : 0}
            className="sticky w-full z-20 top-0 backdrop-blur-sm bg-primary-lighter/75"
        >
            <JumpMenu cardData={cardData} disease={disease} useCardSwitch={useCardSwitch}/>
        </AnimateHeight>
    )
}

export default VisualisationJumpMenu