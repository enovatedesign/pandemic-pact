import type { Metadata } from 'next'

import { fetchMetadataFromCraft } from "../../helpers/cms-page"
import { queryAnnouncements } from "../../helpers/announcement-query"
import VisualisePageClient from "./VisualisePageClient"

export async function generateMetadata(): Promise<Metadata> {
    return fetchMetadataFromCraft('visualise')
}

export default async function Visualise() {
    const announcements = await queryAnnouncements()

    return (
        <VisualisePageClient 
            title="Interactive Charts"
            summary="Visualise our data on research grants for infectious diseases with pandemic potential using filters and searches."
            announcements={announcements}
        />
    ) 
}
