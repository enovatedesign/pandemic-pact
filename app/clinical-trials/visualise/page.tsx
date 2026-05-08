import type { Metadata } from 'next'

import { queryAnnouncementEntry } from '../../helpers/announcement-query'
import ClinicalTrialsComingSoon from '../ClinicalTrialsComingSoon'

export const metadata: Metadata = {
    title: 'Clinical Trial Registrations — Visualise (Coming Soon)',
}

export default async function ClinicalTrialsVisualise() {
    const announcement = await queryAnnouncementEntry()

    return (
        <ClinicalTrialsComingSoon
            title="Clinical Trial Registrations"
            summary="Interactive charts for our clinical trial registrations dataset are on their way."
            announcement={announcement}
        />
    )
}
