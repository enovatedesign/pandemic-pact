import HomepageClient from "./HomepageClient"
import { queryAnnouncements } from "./helpers/announcement-query"
import { fetchMetadataFromCraft } from "./helpers/cms-page"
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    return fetchMetadataFromCraft('homepage')
}

export default async function Explore() {

    const announcements = await queryAnnouncements()

    return <HomepageClient announcements={announcements}/>
}