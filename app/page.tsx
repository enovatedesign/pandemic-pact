"use client"

import styles from "./css/components/masthead.module.css"

import Link from "next/link"

import { links } from "./helpers/nav"
import Header from './components/Header'
import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"

export default function Home() {
    const counterClasses = "text-primary font-bold"

    return (
        <main className="relative flex w-full">
            <aside className="hidden w-[5rem] bg-secondary lg:block">
                <div className="w-full h-full bg-white/10"></div>
            </aside>

            <InteractiveBackground className={`relative grow h-screen min-h-[44rem] lg:min-h-[60rem] masthead-background ${styles.background}`}>
                <Header className="absolute top-0 inset-x-0 z-30"/>

                <div className="relative flex flex-col justify-center items-center space-y-12 w-full h-full z-20 container lg:-translate-y-12 lg:space-y-16">
                    <h2 className="inline-block max-w-3xl text-center text-white text-3xl font-light !leading-snug md:text-4xl lg:text-5xl">
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

                <RotatingGlobe className="!absolute inset-0 z-10"/>
            </InteractiveBackground>
        </main>
    )
}
