import { notFound, redirect } from 'next/navigation'

import { getPageContent, Parameters } from '../../helpers/cms-page'

import PageClient from '../../components/PageClient'
import { queryAnnouncements } from '@/app/helpers/announcement-query'

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<Parameters>
    searchParams: Promise<{ token: string }>
}) {
    const { token } = await searchParams

    const data = await getPageContent(await params, token)
    
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

    return <PageClient data={data} announcements={announcements} />
}
