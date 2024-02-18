import { notFound } from 'next/navigation'

import { getPageContent, Parameters } from '../../helpers/cms-page'

import PageClient from '../../components/PageClient'

export default async function Page({
    params,
    searchParams,
}: {
    params: Parameters
    searchParams: { token: string }
}) {
    const data = await getPageContent(params, searchParams.token)

    if (!data) {
        notFound()
    }

    return <PageClient data={data} />
}
