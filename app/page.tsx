import HomepageClient from "./HomepageClient"
import { queryAnnouncements } from "./helpers/announcement-query"
import { fetchMetadataFromCraft, Parameters } from "./helpers/cms-page"
import type {Metadata, ResolvingMetadata} from 'next'

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    return fetchMetadataFromCraft('homepage')
}

export default async function Explore() {

    const announcements = await queryAnnouncements()

    return <HomepageClient announcements={announcements}/>
}