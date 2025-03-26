import GraphQL from '../../GraphQl'
import {contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function PageQuery(
    uri: string, 
    entryType: string = 'outbreak', 
    sectionHandle: string = 'outbreaks', 
    previewToken?: string
) {
    const data = await GraphQL(
        `
			query($uri:[String]){
				entry: entry(status: "enabled", uri: $uri) {
                    id
                    title
                    typeHandle
                    postDate
                    slug
                    ... on ${sectionHandle}_${entryType}_Entry {
                        ${entryType === 'outbreak' ? 'outbreakPending' : ''}
                        summary
                        showSummary
                        outbreakDisease
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
