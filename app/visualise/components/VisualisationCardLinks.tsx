import { DiseaseLabel, PolicyRoadmapEntryTypeHandle } from "@/app/helpers/types"
import { getVisualisationCards, resolveJumpCardItems } from "./helpers"

import JumpCards from "./JumpCards"

interface VisualisationCardLinksProps {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle | null
    outbreak?: boolean
    disease?: DiseaseLabel
}

const VisualisationCardLinks = ({ policyRoadmapEntryType = null, outbreak = false, disease }: VisualisationCardLinksProps) => {
    const items = resolveJumpCardItems(
        getVisualisationCards({ policyRoadmapEntryType, outbreak, disease }),
        disease,
    )

    return <JumpCards items={items} />
}

export default VisualisationCardLinks
