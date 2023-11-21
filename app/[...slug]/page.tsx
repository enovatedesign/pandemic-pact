import GraphQL from '../lib/GraphQl'
import EntryTypes from '../lib/EntryTypes'
import PageClient from './pageClient'
import { notFound } from 'next/navigation'

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

	interface Entry {
		slug: string, 
		ancestors: Entry[]
	}

	return entries.map(({ slug, ancestors }: Entry) => {
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
interface Parameters {
	preview?: {token: string},
	slug: string[]
}

async function getPageContent(context: Parameters) {

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

    const entryQuery = EntryTypes.queries[entryType]

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

interface PageParameters {
	params: any
}

export default async function Page({params}: PageParameters) {
    const data = await getPageContent(params)
    return <PageClient data={data} />
}