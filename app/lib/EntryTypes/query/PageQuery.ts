import GraphQL from '../../GraphQl'
import {contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function PageQuery(uri: string, entryType: string = 'page', sectionHandle: string = 'pages', previewToken?: string) {

    const data = await GraphQL(
        `
			query($uri:[String]){
				entry: entry(status: "enabled", uri: $uri) {
                    id
                    title
                    typeHandle
                    postDate
                    slug
                    ... on ${entryType}_Entry {
                        summary
                        showSummary
                        outbreak
                        ${contentBuilderQuery}
                    }
                    ${seomaticQuery}
                }
			}
		`,
        { uri },
        previewToken,
    )

    return data
}
