import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { getVisualisationCards, resolveJumpCardItems } from "./helpers"

import ScrollJumpBar from "./ScrollJumpBar"

interface Props {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    outbreak?: boolean
    disease?: DiseaseLabel
}

const VisualisationJumpMenu = ({
    policyRoadmapEntryType = null,
    outbreak = false,
    disease,
}: Props) => {
    const items = resolveJumpCardItems(
        getVisualisationCards({ policyRoadmapEntryType, outbreak, disease }),
        disease,
    )

    return <ScrollJumpBar items={items} />
}

export default VisualisationJumpMenu
