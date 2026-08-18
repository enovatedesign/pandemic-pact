'use client'

import InfoModal from '../components/InfoModal'

interface Props {
    customButtonClasses?: string
    iconSize?: string
}

// Shared "what does this tracker cover?" info modal, used on both the Clinical
// Trials visualise sidebar and the explore page masthead.
export default function ClinicalTrialsCoverageInfoModal({
    customButtonClasses = '',
    iconSize,
}: Props) {
    return (
        <InfoModal
            customButtonClasses={customButtonClasses}
            iconColour="text-primary hover:text-white transition-colors"
            iconSize={iconSize}
        >
            <p>
                This tracker covers all high-PHEIC-risk pathogens outlined in the WHO
                Scientific Framework for Epidemic and Pandemic Research Preparedness
                report, with the exception of COVID-19. Multi-pathogen trials
                investigating COVID-19 alongside other pathogens in scope have been
                included in the dataset. Therefore, direct cross-pathogen comparisons
                involving COVID-19 should be interpreted with caution due to incomplete
                coverage. Expansion of the dataset to cover COVID-19-specific trials is
                under consideration for future iterations of this tracker, and this page
                will be revised accordingly.
            </p>
        </InfoModal>
    )
}
