export default function Page({params}: {params: {id: string}}) {
    return <div>My Grant: {params.id}</div>
}

export async function generateStaticParams() {
    return [
        {
            id: '1',
        },
        {
            id: '2',
        },
        {
            id: '3',
        },
        {
            id: '4',
        },
        {
            id: '5',
        },
    ]
}
