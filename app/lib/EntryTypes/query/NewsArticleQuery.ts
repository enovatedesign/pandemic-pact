import GraphQL from '../../GraphQl'
import {contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function NewsArticleQuery(uri: string, previewToken?: string) {

    const data = await GraphQL(
        `
			query($uri:[String]){
				entry: entry(status: "enabled", uri: $uri) {
                    id
                    title
                    typeHandle
                    postDate
                    slug
                    ... on newsArticle_Entry {
                        summary
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
