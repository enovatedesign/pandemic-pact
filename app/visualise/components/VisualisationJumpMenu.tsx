import AnimateHeight from "react-animate-height"
import JumpMenu from "@/app/components/JumpMenu"
import { visualisationCardData } from './visualisationCardData'

interface Props {
    dropdownVisible: boolean
    outbreak: boolean
}

const VisualisationJumpMenu = ({dropdownVisible, outbreak}: Props) => {
    return (
        <AnimateHeight
            duration={300}
            height={dropdownVisible ? 'auto' : 0}
            className="sticky w-full z-20 top-0 backdrop-blur-sm bg-primary-lighter/75"
        >
            <JumpMenu outbreak={outbreak} cardData={visualisationCardData(outbreak)}/>
        </AnimateHeight>
    )
}

export default VisualisationJumpMenu