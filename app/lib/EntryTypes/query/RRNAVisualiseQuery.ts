import GraphQL from '../../GraphQl'
import {contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function RRNAVisualiseQuery(uri: string, entryType: string = 'rrnaVisualise', sectionHandle: string = 'pages', previewToken?: string) {

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
                        rrnaSummary
                        showSummary
                        ${contentBuilderQuery}
                        bottomAccordion {
                            ... on bottomAccordionBlock_Entry {
                                accordionHeading 
                                accordionContent
                            }
                        }
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
