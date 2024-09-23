import { notFound } from 'next/navigation'

import { getPageContent, Parameters } from '../../helpers/cms-page'

import PageClient from '../../components/PageClient'
import { queryAnnouncementEntry } from '@/app/helpers/announcement-query'

export default async function Page({
    params,
    searchParams,
}: {
    params: Parameters
    searchParams: { token: string }
}) {
    const data = await getPageContent(params, searchParams.token)
    
    const announcement = await queryAnnouncementEntry()
    
    if (!data) {
        notFound()
    }

    return <PageClient data={data} announcement={announcement} />
}
