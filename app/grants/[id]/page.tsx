import fs from 'fs-extra'
import GrantLandingPage from './GrantLandingPage'

export async function generateStaticParams() {
    return fs.readJsonSync('./data/dist/grants/index.json').map(
        (grantId: number) => ({id: `${grantId}`})
    )
}

export default function Page({params}: {params: {id: string}}) {
    const grant = fs.readJsonSync(`./data/dist/grants/${params.id}.json`)

    return (
        <GrantLandingPage grant={grant} />
    )
}
