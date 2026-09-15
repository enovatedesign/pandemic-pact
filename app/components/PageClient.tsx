'use client'

import { AnnouncementProps } from '../helpers/types'
import { CurrentEntry } from '../helpers/context'
import EntryTypes from '../lib/EntryTypes'

interface Props {
    data: any
    announcements: AnnouncementProps[]
}

export default function PageClient({ data, announcements }: Props) {
    const Template = EntryTypes.templates[data.entry.typeHandle]

    return (
        <CurrentEntry.Provider value={{
            sectionHandle: data.sectionHandle ?? '',
            uri: data.uri ?? '',
            typeHandle: data.entry.typeHandle ?? '',
        }}>
            <Template data={data} announcements={announcements} />
        </CurrentEntry.Provider>
    )
}
