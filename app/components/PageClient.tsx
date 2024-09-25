'use client'

import { AnnouncementProps } from '../helpers/types'
import EntryTypes from '../lib/EntryTypes'

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function PageClient({ data, announcement }: Props) {
    const Template = EntryTypes.templates[data.entry.typeHandle]

    return <Template data={data} announcement={announcement} />
}
