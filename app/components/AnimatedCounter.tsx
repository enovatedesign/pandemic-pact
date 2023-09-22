import {useState, useEffect} from "react"
import {useReducedMotion} from "@react-spring/web"

interface Props {
    prefix?: string
    suffix?: string
    finalCount: number,
    duration?: number,
    className?: string,
}

export default function AnimatedCounter({ prefix, suffix, finalCount, duration = 5000, className }: Props) {
    const [count, setCount] = useState<number>(0)
    const reducedMotion = useReducedMotion()

    useEffect(() => {
        if (reducedMotion) return

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
                setCount(Math.ceil(updatedCount));

                if (updatedCount === finalCount) done = true
            }

            if (elapsed < duration) {
                previousTimeStamp = timeStamp;

                if (!done) window.requestAnimationFrame(countUp)
            }
        }

        setTimeout(() => window.requestAnimationFrame(countUp), 1000)

        return () => {
            done = true
        }
	}, [reducedMotion]);

    return (
        <span className={`relative inline-block text-center ${className}`}>
            <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{prefix && prefix}{reducedMotion ? finalCount.toLocaleString() : count.toLocaleString()}{suffix && suffix}</span>
            <span className="invisible whitespace-nowrap" aria-hidden>{prefix && prefix}{finalCount.toLocaleString()}{suffix && suffix}</span>
        </span>
    )
}
