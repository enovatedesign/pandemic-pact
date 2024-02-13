"use client"
import {useState} from "react"
import styles from "./css/components/masthead.module.css"
import Link from "next/link"
import {links} from "./helpers/nav"
import Image from "next/image"
import Header from './components/Header'
import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"
import FooterMenu from "./components/FooterMenu"
import FooterCopyrightStatement from "./components/FooterCopyrightStatement"
import UtilityBar from "./components/UtilityBar"
import homepageTotals from "../data/dist/homepage-totals.json"

export default function Home() {
    const [showMobileNav, setShowMobileNav] = useState(false)
    const counterClasses = "text-primary font-bold"

    return (
        <>
            <div id="skiplink-container">
                <a href="#content" className="block bg-secondary text-center text-white w-full sr-only focus:not-sr-only focus:relative">
                    <span className="flex items-center justify-center py-3 lg:py-4 container">
                        Skip to main content
                    </span>
                </a>
            </div>

            <UtilityBar
                showMobileNav={showMobileNav}
                setShowMobileNav={setShowMobileNav}
            />

            <div className={`masthead-background ${styles.background} flex flex-col h-full min-h-screen relative pb-24 md:pb-28 lg:pb-12`}>

                <Header className="w-full relative z-20" showMobileNav={showMobileNav} />

                <RotatingGlobe className="!absolute inset-x bottom-0 z-10" />

                <div className="grow flex flex-col relative z-10">

                    <main id="content" className="grow flex justify-center items-center">

                        {/* Top content section */}
                        <article aria-labelledby="page-title" className="relative flex flex-col justify-center items-center gap-12 w-full z-20 container">

                            <h1 id="page-title" className="inline-block max-w-4xl text-center text-white text-3xl font-light !leading-snug md:text-4xl lg:text-5xl">
                                Delivering insights from over: <AnimatedCounter prefix="$" className={counterClasses} {...homepageTotals.totalCommittedUsd} /> in research funding across <AnimatedCounter className={counterClasses} {...homepageTotals.totalGrants} /> grants, from <AnimatedCounter className={counterClasses} {...homepageTotals.totalFunders} /> global funders
                            </h1>

                            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8">

                                <Link href={links.visualise.href} className={styles.button}>
                                    <span>{links.visualise.label}</span>

                                    <svg className={styles['chart-icon']} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                        <path d="M0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272z" />
                                        <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80z" />
                                        <path d="M368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
                                    </svg>
                                </Link>

                                <Link href={links.explore.href} className={styles.button}>
                                    <span>{links.explore.label}</span>

                                    <svg className={styles['magnify-icon']} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                                    </svg>
                                </Link>

                            </div>

                            <small>
                                <p className="text-center text-white/60 text-xs md:text-sm max-w-3xl mx-auto">
                                    All visualizations and data produced by Pandemic PACT are open access under the <Link href="http://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="license noopener noreferrer">Creative Commons BY license</Link>. You have permission to use, distribute, and reproduce these in any medium, provided the source and authors are credited. All the software and code that we write is open source and made available via GitHub under the MIT license.
                                </p>
                            </small>

                        </article>

                    </main>

                    {/* Footer */}
                    <footer className="container relative z-20 mt-10 lg:mt-20">

                        <div className="w-full flex flex-col item-center justify-center gap-6 sm:gap-0">

                            <div className="max-w-[12rem] md:max-w-[20rem] mx-auto grid grid-rows-2 grid-cols-2 items-center gap-y-3 gap-x-6 md:gap-y-6 md:gap-x-12 xl:-mb-8">

                                <Image
                                    src="/glopid-r-logo-inverted.png"
                                    alt="GLOPID-R logo"
                                    width={335}
                                    height={79}
                                    className="w-full col-span-2"
                                />

                                <Image
                                    src="/ukcdr-logo.png"
                                    alt="UKCDR logo"
                                    width={276}
                                    height={114}
                                    className="w-full"
                                />

                                <Image
                                    src="/psi-logo-inverted.png"
                                    alt="Pandemic Sciences Institute logo"
                                    width={480}
                                    height={236}
                                    className="w-full"
                                />

                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center">

                                <FooterCopyrightStatement showCreditOnly={true} className="uppercase text-center md:text-left text-gray-300" />

                                <FooterMenu className="flex flex-row flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 md:justify-end" linkClassName="text-gray-300 text-xs uppercase hover:underline" />

                            </div>

                        </div>

                    </footer>

                </div>

                <InteractiveBackground className={`absolute inset-0`}></InteractiveBackground>

            </div>

        </>
    )
}
