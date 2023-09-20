"use client"

import Link from "next/link"

import NavigationMenu from "./components/NavigationMenu"
import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"

export default function Home() {
    const counterClasses = "text-primary font-bold"
    const btnClasses = "flex justify-center px-10 py-3 rounded-full border border-primary/25 navigation-menu uppercase text-center text-white font-medium tracking-wider text-xl"

    return (
        <>
            <NavigationMenu />

            <InteractiveBackground className="relative w-screen h-screen homepage-background">
                <div className="relative flex flex-col justify-center items-center w-full h-full z-20 container">
                    <h2 className="inline-block mb-12 max-w-3xl text-center text-white text-3xl font-light !leading-tight md:text-4xl lg:text-5xl">
                        Delivering insights for over <AnimatedCounter prefix="$" suffix=" billion" finalCount={5} className={counterClasses} /> in research funding across <AnimatedCounter finalCount={21000} className={counterClasses} /> grants provided by <AnimatedCounter finalCount={351} className={counterClasses} /> funding bodies in <AnimatedCounter finalCount={60} className={counterClasses} /> countries, resulting in <AnimatedCounter finalCount={57000} className={counterClasses} /> publications
                    </h2>

                    <div className="grid grid-cols-2 gap-x-8">
                        <Link href="/visualise" className={btnClasses}>
                            <span>Visualise</span>
                        </Link>

                        <Link href="/explore" className={btnClasses}>
                            <span>Explore</span>
                        </Link>
                    </div>
                </div>

                <RotatingGlobe className="!absolute inset-0 z-10"/>
            </InteractiveBackground>
        </>
    )
}
