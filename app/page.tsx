import HomepageClient from "./HomepageClient"
import { fetchMetadataFromCraft, Parameters } from "./helpers/cms-page"
import type {Metadata, ResolvingMetadata} from 'next'

type generateMetadataProps = {
    params: Parameters
}

export async function generateMetadata({ params }: generateMetadataProps, parent: ResolvingMetadata): Promise<Metadata> {
    return fetchMetadataFromCraft('homepage')
}

export default function Explore() {
    return <HomepageClient/>
}