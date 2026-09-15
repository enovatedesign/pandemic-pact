import PageClient from '../components/PageClient'
import {notFound, redirect} from 'next/navigation'
import type {Metadata, ResolvingMetadata} from 'next'
import {
    generateStaticParamsForCmsPages,
    getPageContent,
    Parameters,
    fetchMetadataFromCraft
} from '../helpers/cms-page'
import { queryAnnouncements } from '../helpers/announcement-query'

type generateMetadataProps = {
    params: Promise<Parameters>
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    const { slug } = await params

    return fetchMetadataFromCraft(slug.join('/'))
}

export async function generateStaticParams() {
    return generateStaticParamsForCmsPages()
}

export default async function Page({ params }: { params: Promise<Parameters> }) {
    const data = await getPageContent(await params)
    
    const announcements = await queryAnnouncements()

    if (!data) {
        notFound()
    }

    if (data.entry.typeHandle === 'redirect') {
        const children = data.entry.children ?? []
        const redirectEntry = data.entry.redirectEntry ?? []
        const redirectUrl = children.length > 0
            ? children[0].url
            : redirectEntry.length > 0
                ? redirectEntry[0].url
                : null

        if (redirectUrl) {
            redirect(redirectUrl)
        }

        notFound()
    }

    return (
        <>
            <PageClient data={data} announcements={announcements} />
        </>
    )
}
