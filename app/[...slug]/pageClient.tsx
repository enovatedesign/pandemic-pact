'use client'

import {ComponentType} from 'react'
import EntryTypes from '../lib/EntryTypes'

const formatEntryType = (entryType: string) =>
    entryType.charAt(0).toUpperCase() + entryType.slice(1)

export default function PageClient({data}: any) {
    const entryType = formatEntryType(data.entry.typeHandle)
    const Template = EntryTypes[`${entryType}Template` as keyof typeof EntryTypes] as ComponentType<any>

    return (
        <Template data={data} />
    );
}
