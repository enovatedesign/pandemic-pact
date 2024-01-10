import GraphQL from '../lib/GraphQl'
import EntryTypes from '../lib/EntryTypes'
import PageClient from './pageClient'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
	const craftResponse = await GraphQL(
		`{
			entries(
				status: "enabled",
				uri: ":notempty:"
			) {
				slug
				sectionHandle
				ancestors {
					slug
				}
			}
		}`
	);

    const entries = craftResponse.entries;
	
	interface Entry {
		slug: string,
		sectionHandle: string,
		ancestors?: Entry[]
	}

	return entries.map(({ slug, ancestors }: Entry) => {
		if (!slug) return

		let slugs = [slug]

		if (ancestors && ancestors.length > 0) {
			slugs = [...(ancestors).map(({ slug }) => slug), slug]
		}

		return ({ slug: slugs })
	})
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
			entry: entry(status: "enabled", slug: $slug) {
				typeHandle
				sectionHandle
			}
		}`,
		{ slug },
		previewToken
	);

	if (!entryTypeData.entry) {
		notFound()
	}

    const entryType = entryTypeData.entry.typeHandle
    const sectionHandle = entryTypeData.entry.sectionHandle

    const entryQuery = EntryTypes.queries[entryType]

    const data = await entryQuery(slug, entryType, sectionHandle)

    return data;
}

interface PageParameters {
	params: any
}

export default async function Page({params}: PageParameters) {
    const data = await getPageContent(params)
    return <PageClient data={data} />
}