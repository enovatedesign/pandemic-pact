"use client"

import { useRef, useEffect } from "react"

import AnimatedCounter from "./components/AnimatedCounter"
import RotatingGlobe from "./components/RotatingGlobe"

interface InteractiveBackgroundProps {
    className?: string,
    children: React.ReactNode,
}

export function InteractiveBackground({children, ...rest}: InteractiveBackgroundProps) {
    const canvas = useRef<HTMLCanvasElement>(null)

    const drawCircles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'

        for (let x = 0; x < canvas.width; x += 100) {
            for (let y = 0; y < canvas.height; y += 100) {
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, 2 * Math.PI)
                ctx.fill()
            }
        }
    }

    const initCircleGrid = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        drawCircles(canvas, ctx)

        window.addEventListener('resize', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawCircles(canvas, ctx)
        })
    }

    useEffect(() => {
        if (canvas.current) {
            canvas.current.classList.add('absolute', 'inset-0', 'w-full', 'h-full', 'z-0')
            initCircleGrid(canvas.current)
        }
    }, [canvas?.current])

    return (
        <section {...rest}>
            {children}

            <canvas ref={canvas}></canvas>
        </section>
    )
}


export default function Home() {
    const counterClasses = "text-tremor-brand-subtle font-bold"

    return (
        <InteractiveBackground className="relative w-screen h-screen homepage-background">
            <div className="relative flex justify-center items-center w-full h-full z-20">
                <h2 className="inline-block text-center text-white text-3xl font-light !leading-tight md:text-4xl lg:text-5xl">
                    Delivering insights for<br/>
                    <AnimatedCounter prefix="$" finalCount={5000000000} className={counterClasses}></AnimatedCounter> in research funding<br/>
                    across <AnimatedCounter finalCount={21000} className={counterClasses}></AnimatedCounter> grants, resulting<br/>
                    in <AnimatedCounter finalCount={57000} className={counterClasses}></AnimatedCounter> publications
                </h2>
            </div>

            <RotatingGlobe className="!absolute inset-0 z-10"/>
        </InteractiveBackground>
    )
}

