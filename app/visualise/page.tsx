import VisualisePageClient from "./VisualisePageClient"
import { fetchMetadataFromCraft, Parameters } from "../helpers/cms-page"
import type {Metadata, ResolvingMetadata} from 'next'
import { queryAnnouncementEntry } from "../helpers/announcement-query"

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    return fetchMetadataFromCraft('visualise')
}

export default async function Visualise() {

    const announcement = await queryAnnouncementEntry()

    return (
        <VisualisePageClient 
            title="Interactive Charts"
            summary="Visualise our data on research grants for infectious diseases with pandemic potential using filters and searches."
            announcement={announcement}
        />
    ) 
}