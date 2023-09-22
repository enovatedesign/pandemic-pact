"use client"

import styles from "./css/components/masthead.module.css"

import { useRef, useEffect, MutableRefObject } from "react"
import Link from "next/link"

import { links } from "./helpers/nav"
import NavigationMenu from "./components/NavigationMenu"
import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"

export default function Home() {
    const counterClasses = "text-primary font-bold"

    return (
        <>
            <NavigationMenu />

            <main className="flex">
                <aside className="w-[5rem] bg-secondary">
                    <div className="w-full h-full bg-white/10"></div>
                </aside>

                <InteractiveBackground className={`relative w-screen h-screen masthead-background ${styles.background}`}>
                    <div className="relative flex flex-col justify-center items-center w-full h-full z-20 container lg:-translate-y-16">
                        <h2 className="inline-block mb-12 max-w-3xl text-center text-white text-3xl font-light !leading-tight md:text-4xl lg:mb-20 lg:text-5xl">
                            Delivering insights for over <AnimatedCounter prefix="$" suffix=" billion" finalCount={5} className={counterClasses} /> in research funding across <AnimatedCounter finalCount={21000} className={counterClasses} /> grants provided by <AnimatedCounter finalCount={351} className={counterClasses} /> funding bodies in <AnimatedCounter finalCount={60} className={counterClasses} /> countries, resulting in <AnimatedCounter finalCount={57000} className={counterClasses} /> publications
                        </h2>

                        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8">
                            <Link href={links.visualise.url} className={styles.button}>
                                <span>{links.visualise.label}</span>

                                <svg className={styles['chart-icon']} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                    <path d="M0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272z"/>
                                    <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80z"/>
                                    <path d="M368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/>
                                </svg>
                            </Link>

                            <Link href={links.explore.url} className={styles.button}>
                                <span>{links.explore.label}</span>

                                <svg className={styles['magnify-icon']} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <RotatingGlobe className="!absolute inset-0 z-10"/>
                </InteractiveBackground>
            </main>
        </>
    )
}
