import { useRef, useEffect } from 'react'

/**
 * Props as Recharts 3 actually supplies them to an axis `tick` renderer.
 *
 * Two things changed in Recharts 3 and both are load-bearing here: `cx`/`cy` are no
 * longer passed at all — nothing used them, they were spread onto the `<text>` where
 * they are not valid SVG attributes — and `x`/`y` widened to `string | number`, so
 * they are coerced below rather than assumed numeric.
 */
interface RadiusAxisLabelProps {
    x: string | number
    y: string | number
    payload: { value?: unknown }
}

export default function RadiusAxisLabel({ x, y, payload }: RadiusAxisLabelProps) {
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

    const value = Number(payload.value)

    return value !== 0 && (
        <g className="recharts-layer recharts-polar-radius-axis-tick">
            <text
                ref={textElementRef}
                orientation="right"
                stroke="none"
                x={x}
                y={y}
                className="recharts-text recharts-polar-radius-axis-tick-value text-xs"
                textAnchor="start"
                fill="#ccc"
            >
                <tspan x={x} dy="0em">
                    {value}
                </tspan>
            </text>
        </g>
    )
}
