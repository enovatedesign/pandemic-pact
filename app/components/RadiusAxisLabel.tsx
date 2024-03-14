import { useRef, useEffect } from 'react'

interface Payload {
    value: number
}

interface RadiusAxisLabelProps {
    cx: number
    cy: number
    x: number
    y: number
    payload: Payload
}

export default function RadiusAxisLabel({ cx, cy, x, y, payload }: RadiusAxisLabelProps) {
    const textElementRef = useRef<SVGTextElement>(null)

    useEffect(() => {
        const textElement = textElementRef.current
        if (textElement) {
            const textBoundingBox = textElement.getBBox()
            const textWidth = textBoundingBox.width

            const transformString = `rotate(-90 ${x} ${y}) translate(-${textWidth + 5} -2)`
            textElement.setAttribute('transform', transformString)
        }
    }, [x, y, payload])

    return payload.value !== 0 && ( 
        <g className="recharts-layer recharts-polar-radius-axis-tick">
            <text
                ref={textElementRef}
                cx={cx}
                cy={cy}
                orientation="right"
                stroke="none"
                x={x}
                y={y}
                className="recharts-text recharts-polar-radius-axis-tick-value text-xs"
                textAnchor="start"
                fill="#ccc"
            >
                <tspan x={x} dy="0em">
                    {payload.value}
                </tspan>
            </text>
        </g>
    )
}

