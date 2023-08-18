// TODO only import the specific grant identified by `id` from the dataset if possible

import completeDataset from '../../../data/dist/complete-dataset.json'

export default function Page({params}: {params: {id: string}}) {
    const grant = completeDataset.find((grant: {GrantID: number}) => grant.GrantID === parseInt(params.id))

    return <div>My Grant: {grant.GrantID}</div>
}

export async function generateStaticParams() {
    return completeDataset.map((grant: {GrantID: number}) => ({
        id: `${grant.GrantID}`,
    }))
}
