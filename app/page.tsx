"use client"

import {useState, useEffect} from "react"
import {millify} from "millify"

import RotatingGlobe from "./components/RotatingGlobe"

interface AnimatedCounterProps {
    prefix?: string
    finalCount: number,
    duration?: number
}

export function AnimatedCounter({ prefix, finalCount, duration = 5000 }: AnimatedCounterProps) {
    const [count, setCount] = useState<number>(0)
    const [countLabel, setCountLabel] = useState<string>('0')

    useEffect(() => {
        setCountLabel(millify(count, {
            units: ['', 'K', 'm', 'bn', 'T']
        }))
    }, [count]) 

    useEffect(() => {
        const easeInOutQuint = (x: number) => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;

        let start:number, previousTimeStamp:number
        let done:boolean = false

        const countUp = (timeStamp: number) => {
            if (start === undefined) {
                start = timeStamp;
            }
            const elapsed = timeStamp - start;

            if (previousTimeStamp !== timeStamp) {
                const updatedCount = easeInOutQuint(elapsed / duration) * finalCount
                setCount(updatedCount);

                if (updatedCount === finalCount) done = true
            }

            if (elapsed < duration) {
                previousTimeStamp = timeStamp;

                if (!done) window.requestAnimationFrame(countUp)
            }
        }

        setTimeout(() => window.requestAnimationFrame(countUp), 1000)
	}, []);

    return (
        <span className="text-tremor-brand-subtle font-bold">
            {prefix && prefix}{countLabel}
        </span>
    )
}

export default function Home() {
    return (
        <section className="relative w-screen h-screen homepage-background">
            <div className="relative flex justify-center items-center w-full h-full z-10">
                <h2 className="inline-block text-center text-white text-3xl font-light !leading-tight md:text-4xl lg:text-5xl">
                    Delivering insights for<br/>
                    <AnimatedCounter prefix="$" finalCount={5000000000}></AnimatedCounter> in research funding<br/>
                    across <AnimatedCounter finalCount={21000}></AnimatedCounter> grants, resulting<br/>
                    in <AnimatedCounter finalCount={57000}></AnimatedCounter> publications
                </h2>
            </div>

            <RotatingGlobe className="!absolute inset-0"/>
        </section>
    )
}

