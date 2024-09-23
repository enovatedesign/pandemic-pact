import PageClient from '../components/PageClient'
import {notFound} from 'next/navigation'
import type {Metadata, ResolvingMetadata} from 'next'
import {
    generateStaticParamsForCmsPages,
    getPageContent,
    Parameters,
    fetchMetadataFromCraft
} from '../helpers/cms-page'
import { queryAnnouncementEntry } from '../helpers/announcement-query'

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    return fetchMetadataFromCraft(params.slug.join('/'))
}

export async function generateStaticParams() {
    return generateStaticParamsForCmsPages()
}

export default async function Page({ params }: { params: Parameters }) {
    const data = await getPageContent(params)
    
    const announcement = await queryAnnouncementEntry()

    if (!data) {
        notFound()
    }

    return (
        <>
            <PageClient data={data} announcement={announcement} />
        </>
    )
}
