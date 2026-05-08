import type { Metadata } from 'next'

import { queryAnnouncementEntry } from '../../helpers/announcement-query'
import ClinicalTrialsComingSoon from '../ClinicalTrialsComingSoon'

export const metadata: Metadata = {
    title: 'Clinical Trial Registrations — Explore (Coming Soon)',
}

export default async function ClinicalTrialsExplore() {
    const announcement = await queryAnnouncementEntry()

    return (
        <ClinicalTrialsComingSoon
            title="Clinical Trial Registrations"
            summary="Search and exploration tools for our clinical trial registrations dataset are on their way."
            announcement={announcement}
        />
    )
}
