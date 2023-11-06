"use client"
import styles from "./css/components/masthead.module.css"
import Link from "next/link"
import { links } from "./helpers/nav"
import Image from "next/image"
import Header from './components/Header'
import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"
import Footer from "./components/Footer"
import FooterMenu from "./components/FooterMenu"
import FooterCopyrightStatement from "./components/FooterCopyrightStatement"

export default function Home() {
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
            <div className="w-full relative">
                <main>

                    <article aria-labelledby="page-title"> 

                        <InteractiveBackground className={`relative grow h-screen min-h-[44rem] lg:min-h-[60rem] masthead-background ${styles.background}`}>
                            <Header className="absolute w-full left-0 z-30"/>

                            <div id="content" className="relative flex flex-col justify-center items-center space-y-12 w-full h-full z-20 container lg:-translate-y-12 lg:space-y-16">
                                <h2 id="page-title" className="inline-block max-w-3xl text-center text-white text-3xl font-light !leading-snug md:text-4xl lg:text-5xl">
                                    Delivering insights for over: <AnimatedCounter prefix="$" suffix=" billion" finalCount={5} className={counterClasses} /> in research funding across <AnimatedCounter finalCount={21000} className={counterClasses} /> grants, from <AnimatedCounter finalCount={351} className={counterClasses} /> global funders
                                </h2>

                                <Link href={links.visualise.href} className={styles.button}>
                                    <span>{links.visualise.label}</span>

                                    <svg className={styles['chart-icon']} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                        <path d="M0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272z"/>
                                        <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80z"/>
                                        <path d="M368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/>
                                    </svg>
                                </Link>

                                <p className="text-center text-white/50">License text to go here lorem ipsum dolor amet.</p>
                            </div>

                            <div className="absolute inset-x bottom-6 w-full z-20">

                                <div className="container">

                                    <div className="flex flex-col md:flex-row flex-wrap gap-y-3 justify-between items-center">

                                        <div className="order-2 flex flex-1 2xl:order-1">
                                            <FooterCopyrightStatement showCredit={false} className="text-center md:text-left text-gray-300" />
                                        </div>

                                        <div className="order-1 w-full 2xl:w-auto 2xl:order-2">                                      

                                            <div className="grid grid-cols-3 mx-auto gap-6 md:gap-10 items-center max-w-md">
                                                    
                                                <Image
                                                    src="/glopid-r-logo-inverted.png"
                                                    alt="GLOPID-R logo"
                                                    width={335}
                                                    height={79}
                                                    className="w-full"
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

                                        </div>

                                        <div className="order-3 flex md:justify-end flex-1 2xl:order-3">
                                            <FooterMenu className="flex flex-row flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 md:justify-end" linkClassName="text-gray-300 text-xs uppercase hover:underline"/>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <RotatingGlobe className="!absolute inset-0 z-10"/>

                        </InteractiveBackground>

                    </article>
                </main>
            </div>
        </>
    )
}
