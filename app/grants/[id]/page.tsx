import {Suspense} from 'react'
import fs from 'fs-extra'
import {notFound} from 'next/navigation'
import StaticPage from './StaticPage'
import ClientPage from './ClientPage'

export async function generateStaticParams() {
    return fs.readJsonSync('./data/dist/grants/index.json').map(
        (grantId: number) => ({id: `${grantId}`})
    )
}

export default function Page({params}: {params: {id: string}}) {
    const path = `./data/dist/grants/${params.id}.json`

    if (!fs.existsSync(path)) {
        notFound()
    }

    const grant = fs.readJsonSync(path)

    // Note that the `Suspense` here is to avoid the following error:
    // https://nextjs.org/docs/messages/deopted-into-client-rendering

    return (
        <Suspense fallback={<StaticPage grant={grant} />}>
            <ClientPage grant={grant} />
        </Suspense>
    )
}
