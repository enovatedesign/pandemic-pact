import {Suspense} from 'react'
import fs from 'fs-extra'
import GrantLandingPage from './GrantLandingPage'

export async function generateStaticParams() {
    return fs.readJsonSync('./data/dist/grants/index.json').map(
        (grantId: number) => ({id: `${grantId}`})
    )
}

export default function Page({params}: {params: {id: string}}) {
    const grant = fs.readJsonSync(`./data/dist/grants/${params.id}.json`)

    // Note that the `Suspense` here is to suppress the following error:
    // https://nextjs.org/docs/messages/deopted-into-client-rendering
    // TODO use the `Suspense` `fallback` to render the page without
    // the search result highlight text

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GrantLandingPage grant={grant} />
        </Suspense>
    )
}
