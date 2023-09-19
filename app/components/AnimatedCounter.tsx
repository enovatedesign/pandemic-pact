import {useState, useEffect} from "react"
import {millify} from "millify"

interface Props {
    prefix?: string
    finalCount: number,
    duration?: number,
    className?: string,
}

export default function AnimatedCounter({ prefix, finalCount, duration = 5000, className }: Props) {
    const [count, setCount] = useState<number>(0)
    const [countLabel, setCountLabel] = useState<string>('0')

    useEffect(() => {
        setCountLabel(millify(count, {
            units: ['', 'k', 'm', 'b', 't']
        }))
    }, [count]) 

    useEffect(() => {
        const easeInOutQuint = (x: number) => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
        const easeInOutQuad = (x:number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

        let start:number, previousTimeStamp:number
        let done:boolean = false

        const countUp = (timeStamp: number) => {
            if (start === undefined) {
                start = timeStamp;
            }
            const elapsed = timeStamp - start;

            if (previousTimeStamp !== timeStamp) {
                const updatedCount = easeInOutQuad(elapsed / duration) * finalCount
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
        <span className={className}>
            {prefix && prefix}{countLabel}
        </span>
    )
}
