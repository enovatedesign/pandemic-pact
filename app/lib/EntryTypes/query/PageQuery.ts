import GraphQL from '../../GraphQl'
import { contentBuilderQuery, seomaticQuery } from '../../Queries'

export default async function PageQuery(slug: String, entryType: String = 'page') {

	const data = await GraphQL(
		`
			query($slug:[String]){
				entry: entry(status: "enabled", section: "pages", slug: $slug) {
                    id
                    title
                    typeHandle
                    postDate
                    ... on pages_${entryType}_Entry {
                        summary
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
		}
	)

    return data
}