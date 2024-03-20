import VisualisePageClient from './VisualisePageClient'
import { fetchMetadataFromCraft, Parameters } from '../helpers/cms-page'
import type { Metadata, ResolvingMetadata } from 'next'

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata(
    { params }: generateMetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    console.time('fetch viz metadata')

    const metadata = fetchMetadataFromCraft('visualise')

    console.timeEnd('fetch viz metadata')

    return metadata
}

export default async function Visualise() {
    return <VisualisePageClient />
}

