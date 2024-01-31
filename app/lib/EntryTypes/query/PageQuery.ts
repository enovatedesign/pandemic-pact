import GraphQL from '../../GraphQl'
import {contentBuilderQuery, seomaticQuery} from '../../Queries'

export default async function PageQuery(slug: string, entryType: string = 'page', sectionHandle: string = 'pages', previewToken?: string) {

    const data = await GraphQL(
        `
			query($slug:[String]){
				entry: entry(status: "enabled", slug: $slug) {
                    id
                    title
                    typeHandle
                    postDate
                    slug
                    ... on ${sectionHandle}_${entryType}_Entry {
                        summary
                        showSummary
                        imageMasthead {
                            ... on contentAssets_Asset {
                                url(transform: "c1400xauto")
                                altText
                                focalPoint
                                width
                                height
                            }
                          }
                          imageSliderMasthead {
                            ... on imageSliderMasthead_BlockType {
                              id
                              slideText
                              slideImage {
                                ... on contentAssets_Asset {
                                    url(transform: "c1400xauto")
                                    altText
                                    focalPoint
                                    width
                                    height
                                }
                              }
                              slideHeading
                              slideButton {
                                customText
                                text
                                url
                                title
                                target
                                element {
                                  title
                                  uri
                                }
                              }
                            }
                          }

                        ${contentBuilderQuery}
                    }
                    ${seomaticQuery}
                }
			}
		`,
        {
            slug
        },
        previewToken,
    )

    return data
}
