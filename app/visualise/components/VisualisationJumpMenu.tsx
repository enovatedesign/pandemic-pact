import AnimateHeight from "react-animate-height"

import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { getVisualisationCards } from "./helpers"

import JumpMenu from "@/app/components/JumpMenu"

interface Props {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    dropdownVisible: boolean
    outbreak: boolean
    disease?: DiseaseLabel
}

const VisualisationJumpMenu = ({ 
    policyRoadmapEntryType = null, 
    dropdownVisible, 
    outbreak = false, 
    disease 
}: Props) => {
    const cardData = getVisualisationCards({ policyRoadmapEntryType, outbreak, disease });

    return cardData.length > 0 && (
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