import GraphQL from '../lib/GraphQl'
import EntryTypes from '../lib/EntryTypes'

export interface Parameters {
    slug: string[]
}

export async function generateStaticParamsForCmsPages() {
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
    )

    const entries = craftResponse.entries

    interface Entry {
        slug: string
        sectionHandle: string
        ancestors?: Entry[]
    }

    return entries.map(({ slug, ancestors }: Entry) => {
        if (!slug) return

        let slugs = [slug]

        if (ancestors && ancestors.length > 0) {
            slugs = [...ancestors.map(({ slug }) => slug), slug]
        }

        return { slug: slugs }
    })
}

export async function getPageContent(
    context: Parameters,
    previewToken?: string
) {
    const slug = context.slug[context.slug.length - 1] ?? undefined

    const entryTypeData = await GraphQL(
        `query($slug:[String]){
			entry: entry(status: "enabled", slug: $slug) {
				typeHandle
				sectionHandle
			}
		}`,
        { slug },
        previewToken
    )

    if (!entryTypeData.entry) {
        return null
    }

    const entryType = entryTypeData.entry.typeHandle
    const sectionHandle = entryTypeData.entry.sectionHandle

    const entryQuery = EntryTypes.queries[entryType]

    const data = await entryQuery(slug, entryType, sectionHandle, previewToken)

    return data
}
