import { Suspense } from 'react'
import type { Metadata } from 'next'

import { queryAnnouncementEntry } from '../../helpers/announcement-query'
import ExplorePageClient from './ExplorePageClient'

export const metadata: Metadata = {
    title: 'Clinical Research Registrations — Explore',
}

export default async function ClinicalTrialsExplore() {
    //  Note that the `Suspense` here is to suppress the following error:
    //  https://nextjs.org/docs/messages/deopted-into-client-rendering
    const announcement = await queryAnnouncementEntry()

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExplorePageClient announcement={announcement} />
        </Suspense>
    )
}
