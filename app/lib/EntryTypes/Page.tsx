"use client"

import styles from "../../css/components/masthead.module.css"
import GraphQL from '../GraphQl'
import { contentBuilderQuery, seomaticQuery } from '../Queries'
import Link from "next/link"
import { links } from "../../helpers/nav"
import Header from '../../components/Header'
import InteractiveBackground from "../../components/InteractiveBackground"
import Matrix from "../../components/ContentBuilder"
import HtmlHead from "../../components/HtmlHead"

const query = async (slug: String, entryType = 'page') => {

	const { data } = await GraphQL(
		`
			query($slug:[String]){
				entry: entry(status: "enabled", section: "pages", slug: $slug) {
                    id
                    title
                    typeHandle
                    postDate
                    ... on pages_${entryType}_Entry {
                        summary
                        mastheadImage {
                            ... on contentAssets_Asset {
                                url(transform: "c1400xauto")
                                altText
                                focalPoint
                                width
                                height
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

const Page = ({ data }) => {
    
    const { entry, defaultMastheadImage } = data

	// return (
	// 	<>
	// 		<HtmlHead data={entry.seomatic} />
		
	// 		<Masthead title={entry.title}
	// 			summary={entry.summary}
    //             postDate={postDate}
    //             mastheadImage={entry.mastheadImage}
    //             defaultMastheadImage={defaultMastheadImage}
    //         />

	// 		<Matrix blocks={entry.bodyContent} />
	// 	</>
	// );

    return (
        <>
            <HtmlHead data={entry.seomatic} />
            <main className="">
                <aside className="hidden w-[5rem] bg-secondary lg:block">
                    <div className="w-full h-full bg-white/10"></div>
                </aside>

                <InteractiveBackground className={`relative grow h-screen masthead-background ${styles.background}`}>
                    <Header className="absolute top-0 inset-x-0 z-30"/>
                </InteractiveBackground>

                <Matrix blocks={entry.bodyContent} />
            </main>
        </>
    )
}

export {
    query,
    Page
}
