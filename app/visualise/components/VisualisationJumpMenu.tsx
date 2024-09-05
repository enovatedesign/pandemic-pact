import AnimateHeight from "react-animate-height"
import JumpMenu from "@/app/components/JumpMenu"
import { visualisationCardData } from './visualisationCardData'
import { DiseaseLabel } from "@/app/helpers/types"

interface Props {
    dropdownVisible: boolean
    outbreak: boolean
    disease?: DiseaseLabel
}

const VisualisationJumpMenu = ({dropdownVisible, outbreak, disease}: Props) => {
    
    const cardSwitch: DiseaseLabel = disease ?? 'default'

    const cardData = visualisationCardData(outbreak ,disease).filter(
        card => card.showCard[cardSwitch] && card.showChevron[cardSwitch]
    )

    return (
        <AnimateHeight
            duration={300}
            height={dropdownVisible ? 'auto' : 0}
            className="sticky w-full z-20 top-0 backdrop-blur-sm bg-primary-lighter/75"
        >
            <JumpMenu cardData={cardData}/>
        </AnimateHeight>
    )
}

export default VisualisationJumpMenu