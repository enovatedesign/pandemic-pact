"use client"

import styles from "../../../css/components/masthead.module.css"
import Link from "next/link"
import { links } from "../../../helpers/nav"
import Header from '../../../components/Header'
import InteractiveBackground from "../../../components/InteractiveBackground"
import Matrix from "../../../components/ContentBuilder"
import HtmlHead from "../../../components/HtmlHead"

export default function PageTemplate({data}) {

    const { entry } = data

    // console.log('Page Template Data: ', entry)

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
