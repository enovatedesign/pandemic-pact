'use client'

import EntryTypes from '../lib/EntryTypes'

export default function PageClient({ data }: any) {
    const Template = EntryTypes.templates[data.entry.typeHandle]

    return <Template data={data} />
}
