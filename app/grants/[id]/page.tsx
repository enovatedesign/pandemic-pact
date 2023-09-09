import {Suspense} from 'react'
import fs from 'fs-extra'
import StaticPage from './StaticPage'
import ClientPage from './ClientPage'

export async function generateStaticParams() {
    return fs.readJsonSync('./data/dist/grants/index.json').map(
        (grantId: number) => ({id: `${grantId}`})
    )
}

export default function Page({params}: {params: {id: string}}) {
    const grant = fs.readJsonSync(`./data/dist/grants/${params.id}.json`)

    // Note that the `Suspense` here is to avoid the following error:
    // https://nextjs.org/docs/messages/deopted-into-client-rendering

    return (
        <Suspense fallback={<StaticPage grant={grant} />}>
            <ClientPage grant={grant} />
        </Suspense>
    )
}
