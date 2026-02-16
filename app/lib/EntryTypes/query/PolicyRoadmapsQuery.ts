import GraphQL from '../../GraphQl'
import { contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function policyRoadmapsQuery(
    uri: string, 
    entryType: string = 'hundredDaysMission', 
    sectionHandle: string = 'policyRoadmaps',
    previewToken?: string
) {
    const data = await GraphQL(`
        query($uri:[String]){
            entry: entry(status: "enabled", uri: $uri) {
                id
                title
                typeHandle
                postDate
                slug
                ... on ${entryType}_Entry {
                    ${entryType === 'pandemicIntelligence' ? 'modalLinkText modalText' : ''}
                    richTextSummary
                    showSummary
                    ${contentBuilderQuery}
                }
                ${seomaticQuery}
            }
        }`,
        { uri },
        previewToken,
    )

    return data
}
