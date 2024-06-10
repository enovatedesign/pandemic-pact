import GraphQL from '../lib/GraphQl'
import EntryTypes from '../lib/EntryTypes'
import {getMetadata} from 'next-seomatic'
import { defaultMetaData } from './default-meta-data'

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
                typeHandle
				ancestors {
					slug
				}
			}
		}`
    )

    interface Entry {
        slug: string
        typeHandle: string
        ancestors?: Entry[]
    }

    const entries: Entry[] = craftResponse.entries

    return entries
        .filter(
            ({ typeHandle }) => EntryTypes.queries[typeHandle] !== undefined
        )
        .map(({ slug, ancestors }) => {
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

    const uri = context.slug.join('/')

    const entryTypeData = await GraphQL(
        `query($uri:[String]){
			entry: entry(status: "enabled", uri: $uri) {
				typeHandle
				sectionHandle
			}
		}`,
        { uri },
        previewToken
    )

    if (!entryTypeData.entry) {
        return null
    }

    const entryType = entryTypeData.entry.typeHandle
    const sectionHandle = entryTypeData.entry.sectionHandle

    const entryQuery = EntryTypes.queries[entryType]

    if (!entryQuery) {
        return null
    }

    const data = await entryQuery(uri, entryType, sectionHandle, previewToken)

    return data
}


export async function fetchMetadataFromCraft(uri: string) {
    
    // Fetch the metadata for the current page
    const metaDataQuery = await GraphQL(
        `query($uri:[String]){
            entry: entry(status: "enabled", uri: $uri) {
                seomatic(asArray: true) {
                    metaJsonLdContainer
                    metaLinkContainer
                    metaScriptContainer
                    metaSiteVarsContainer
                    metaTagContainer
                    metaTitleContainer
                }
            }
        }`,
        {uri},
    )

    if (!metaDataQuery.entry) {
        return {...defaultMetaData}
    }
   
    return getMetadata(metaDataQuery.entry.seomatic);
}
