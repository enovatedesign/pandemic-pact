"use client"

import AnimatedCounter from "./components/AnimatedCounter"
import InteractiveBackground from "./components/InteractiveBackground"
import RotatingGlobe from "./components/RotatingGlobe"

export default function Home() {
    const counterClasses = "text-secondary font-bold"

    return (
        <InteractiveBackground className="relative w-screen h-screen homepage-background">
            <div className="relative flex justify-center items-center w-full h-full z-20">
                <h2 className="inline-block max-w-3xl text-center text-white text-3xl font-light !leading-tight md:text-4xl lg:text-5xl">
                    Delivering insights for over <AnimatedCounter prefix="$" suffix=" billion" finalCount={5} className={counterClasses} /> in research funding across <AnimatedCounter finalCount={21000} className={counterClasses} /> grants provided by <AnimatedCounter finalCount={351} className={counterClasses} /> funding bodies in <AnimatedCounter finalCount={60} className={counterClasses} /> countries, resulting in <AnimatedCounter finalCount={57000} className={counterClasses} /> publications
                </h2>
            </div>

            <RotatingGlobe className="!absolute inset-0 z-10"/>
        </InteractiveBackground>
    )
}
