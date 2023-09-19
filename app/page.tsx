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

    const drawCircles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, mouse?: {x:number, y:number}) => {
        const width = canvas.clientWidth
        const height = canvas.clientHeight

        const centerX = width / 2
        const centerY = height / 2
        const maxRadius = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))

        canvas.width = width
        canvas.height = height
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'

        if (!mouse) {
            mouse = {
                x: centerX,
                y: centerY,
            }
        }

        for (let x = 0; x < canvas.width; x += 100) {
            for (let y = 0; y < canvas.height; y += 100) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
                // Increase the radius to make the effect more pronounced
                const radius = (maxRadius - distance) / maxRadius * 30

                const angle = Math.atan2(mouse.y - y, mouse.x - x)
                const newX = x + Math.cos(angle) * radius
                const newY = y + Math.sin(angle) * radius

                ctx.beginPath()
                ctx.arc(newX, newY, 3, 0, 2 * Math.PI)
                ctx.closePath()
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

        window.addEventListener('mousemove', event => {
            const bounds = canvas.getBoundingClientRect();

            const mouse = {
                x: event.pageX - bounds.left - scrollX,
                y: event.pageY - bounds.top - scrollY
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawCircles(canvas, ctx, mouse)
        });
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

