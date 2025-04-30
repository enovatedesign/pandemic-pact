import { Suspense } from "react"
import type {Metadata, ResolvingMetadata} from 'next'

import { fetchMetadataFromCraft, Parameters } from "../helpers/cms-page"
import { queryAnnouncementEntry } from "../helpers/announcement-query"

import ExplorePageClient from "./ExplorePageClient"

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    return fetchMetadataFromCraft('grants')
}

export default async function Explore() {

    //  Note that the `Suspense` here is to suppress the following error:
    //  https://nextjs.org/docs/messages/deopted-into-client-rendering
    //  TODO work out what to do with the `Suspense` `fallback`

    const announcement = await queryAnnouncementEntry()

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExplorePageClient announcement={announcement}/>
        </Suspense>
    ) 
}