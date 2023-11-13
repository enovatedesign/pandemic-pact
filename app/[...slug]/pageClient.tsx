'use client'

import EntryTypes from '../lib/EntryTypes'

const formatEntryType = (entryType: string) => 
    entryType.charAt(0).toUpperCase() + entryType.slice(1)

export default function PageClient({data}: any) {
    console.log(EntryTypes)
    const entryType = formatEntryType(data.entry.typeHandle)
    const Template = EntryTypes[`${entryType}Template` as keyof typeof EntryTypes]

	return ( 
        <Template data={data} />
	);
}