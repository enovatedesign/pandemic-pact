import AnimateHeight from "react-animate-height"
import JumpMenu from "@/app/components/JumpMenu"
import { visualisationCardData } from './visualisationCardData'

interface Props {
    dropdownVisible: boolean
}

const VisualisationJumpMenu = ({dropdownVisible}: Props) => {
    return (
    <AnimateHeight
        duration={300}
        height={dropdownVisible ? 'auto' : 0}
        className="sticky w-full z-20 top-0 bg-primary-lighter/75 backdrop-blur-sm"
    >
        <JumpMenu cardData={visualisationCardData} />
    </AnimateHeight>
    )
}

export default VisualisationJumpMenu