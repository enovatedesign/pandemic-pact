import type { Metadata } from 'next'

import { fetchMetadataFromCraft } from "../helpers/cms-page"
import { queryAnnouncementEntry } from "../helpers/announcement-query"
import VisualisePageClient from "./VisualisePageClient"
import Summary from '../components/VisualiseAndExplorePageSummary'

export async function generateMetadata(): Promise<Metadata> {
    return fetchMetadataFromCraft('visualise')
}

export default async function Visualise() {
    const announcement = await queryAnnouncementEntry()

    return (
        <VisualisePageClient 
            title="Interactive Charts"
            summary={Summary({ 
                mainSummary: "Visualise our data on research grants for infectious diseases with pandemic potential using filters and searches."
            })}
            announcement={announcement}
        />
    ) 
}
