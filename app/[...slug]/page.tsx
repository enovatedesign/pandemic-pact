import { notFound } from 'next/navigation'

import {
    generateStaticParamsForCmsPages,
    getPageContent,
    Parameters,
} from '../helpers/cms-page'

import PageClient from '../components/PageClient'

export async function generateStaticParams() {
    return generateStaticParamsForCmsPages()
}

export default async function Page({ params }: { params: Parameters }) {
    console.log('cms frontend page', params.slug)

    const data = await getPageContent(params)

    console.log('cms frontend page fetched', params.slug)

    if (!data) {
        notFound()
    }

    return <PageClient data={data} />
}
