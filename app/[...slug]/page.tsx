import GraphQL from '../lib/GraphQl'
import * as EntryTypes from '../lib/EntryTypes'
import PageClient from './pageClient'
import {type Slug, Ancestors} from "../types/cms"
import { notFound } from 'next/navigation'

const formatEntryType = entryType => 
    entryType.charAt(0).toUpperCase() + entryType.slice(1)

export async function generateStaticParams() {
	const craftResponse = await GraphQL(
		`{
			entries(
				status: "enabled", 
				section: "pages"
			) {
				slug
				ancestors {
					slug
				}
			}
		}`
	);

    const entries = craftResponse.entries;

	return entries.map(({ slug, ancestors }) => {
		const slugs = [...ancestors.map(({ slug }) => slug), slug]
		return ({ slug: slugs })
	})

	// return {
	// 	paths: entries.map(({ slug, ancestors }) => {
    //         const slugs = [...ancestors.map(({ slug }) => slug), slug]

    //         return ({
    //             params: { slug: slugs }
    //         })
    //     }),
	// 	fallback: 'blocking',
	// };
}

async function getPageContent(context) {

	const previewToken = context?.preview?.token ?? undefined;

    const slug = context.slug[context.slug.length - 1] ?? undefined;

	const entryTypeData = await GraphQL(
		`query($slug:[String]){
			entry: entry(status: "enabled", section: "pages", slug: $slug) {
				typeHandle
			}
		}`,
		{ slug },
		previewToken
	);

	if (!entryTypeData.entry) {
		notFound()
	}

    const entryType = entryTypeData.entry.typeHandle

    const formattedEntryType = formatEntryType(entryType)

    const entryQuery = EntryTypes[`${formattedEntryType}Query`]

    const data = await entryQuery(slug, entryType)

    return data;

	// return {
	// 	props: {
	// 		key: data?.entry?.id,
	// 		data: data
	// 	},
    //     revalidate: 60,
	// 	notFound: data.entry === null,
	// };
}

export default async function Page({ params }) {
    const data = await getPageContent(params)
   
    return <PageClient data={data} />
}