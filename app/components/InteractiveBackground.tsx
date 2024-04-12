import {useRef, useEffect, useCallback} from "react"
import {useReducedMotion} from "@react-spring/web"

interface Props {
    className?: string,
    children?: React.ReactNode,
}

export default function InteractiveBackground({children, ...rest}: Props) {
    const canvas = useRef<HTMLCanvasElement>(null)
    const animate = useRef<boolean>(true)
    const reducedMotion = useReducedMotion()

    useEffect(() => {
        animate.current = !reducedMotion
    }, [reducedMotion])

    const drawCircles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, mouse?: {x: number, y: number}) => {
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

    const initCircleGrid = useCallback((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let mouse = {
            x: canvas.clientWidth / 2,
            y: canvas.clientHeight / 2,
        }

        const handleAnimation = (event: MouseEvent) => {
            if (!animate.current) return

            const bounds = canvas.getBoundingClientRect();

            mouse.x = event.pageX - bounds.left - scrollX
            mouse.y = event.pageY - bounds.top - scrollY

            window.requestAnimationFrame(drawCircles.bind(null, canvas, ctx, mouse))
        }

        window.addEventListener('mousemove', handleAnimation)
        window.addEventListener('resize', drawCircles.bind(null, canvas, ctx, mouse))
        window.requestAnimationFrame(drawCircles.bind(null, canvas, ctx, mouse))

        const removeListeners = () => {
            window.removeEventListener('mousemove', handleAnimation)
            window.removeEventListener('resize', drawCircles.bind(null, canvas, ctx, mouse))
        }

        return removeListeners
    }, [animate])

    useEffect(() => {
        if (canvas.current) {
            const removeListeners = initCircleGrid(canvas.current)

            return () => {
                if (removeListeners) removeListeners()
            }
        }
    }, [canvas, initCircleGrid])

    return (
        <section {...rest}>
            {children}
            <canvas className="bg-dots absolute inset-0 w-full h-full z-0 md:hidden"></canvas>
            <canvas ref={canvas} className="absolute inset-0 w-full h-full z-0 hidden md:block"></canvas>
        </section>
    )
}
