import type { Metadata } from 'next'

import { queryAnnouncements } from '../../helpers/announcement-query'
import VisualisePageClient from './VisualisePageClient'

export const metadata: Metadata = {
    title: 'Clinical Research Registrations — Visualise',
}

export default async function ClinicalTrialsVisualise() {
    const announcements = await queryAnnouncements()

    return (
        <VisualisePageClient
            title="Clinical Research Registrations"
            summary="Visualise registered clinical trials for infectious diseases with pandemic potential using filters and searches."
            announcements={announcements}
        />
    )
}
