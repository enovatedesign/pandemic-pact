import GraphQL from '../../GraphQl'
import { seomaticQuery } from '../../Queries'

export default async function RedirectQuery(uri: string) {

    const data = await GraphQL(
        `
			query($uri:[String]){
				entry: entry(status: "enabled", uri: $uri) {
                    typeHandle
                    ... on pages_redirect_Entry {
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
        { uri }
    )

    return data
}
