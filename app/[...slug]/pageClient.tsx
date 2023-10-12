'use client'

import * as EntryTypes from '../lib/EntryTypes'

const formatEntryType = entryType => 
    entryType.charAt(0).toUpperCase() + entryType.slice(1)

export default function PageClient({data}) {

    const entryType = formatEntryType(data.entry.typeHandle)
    const Template = EntryTypes[`${entryType}Template`]

	return (
        <Template data={data} />
	);
}