'use client'

import { AnnouncementProps } from '../helpers/types'
import { CurrentEntry } from '../helpers/context'
import EntryTypes from '../lib/EntryTypes'

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function PageClient({ data, announcement }: Props) {
    const Template = EntryTypes.templates[data.entry.typeHandle]

    return (
        <CurrentEntry.Provider value={{
            sectionHandle: data.sectionHandle ?? '',
            uri: data.uri ?? '',
            typeHandle: data.entry.typeHandle ?? '',
        }}>
            <Template data={data} announcement={announcement} />
        </CurrentEntry.Provider>
    )
}
