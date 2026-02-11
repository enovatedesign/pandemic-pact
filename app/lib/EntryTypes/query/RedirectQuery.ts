import GraphQL from '../../GraphQl'
import { seomaticQuery } from '../../Queries'

export default async function RedirectQuery(uri: string, entryType: string = 'redirect', sectionHandle: string = 'pages', previewToken?: string) {

    const data = await GraphQL(
        `
			query($uri:[String]){
				entry: entry(status: "enabled", uri: $uri) {
                    typeHandle
                    ... on ${entryType}_Entry {
                        redirectEntry {
                            url
                        }
                        children {
                            url
                        }
                    }
                    ${seomaticQuery}
                }
			}
		`,
        { uri },
        previewToken
    )

    return data
}
