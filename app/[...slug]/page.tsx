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
    const data = await getPageContent(params)

    if (!data) {
        notFound()
    }

    return <PageClient data={data} />
}
