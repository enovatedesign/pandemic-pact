"use client"

import {useState, useEffect, useContext, MouseEvent} from "react"
import seedrandom from 'seedrandom'
import dataset from '../../data/dist/filterable-dataset.json'
import WordCloudComponent from 'react-d3-cloud'
import {TooltipContext} from '../helpers/tooltip'

import font from '../globals/font'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

interface Props {
    filterKey: string
    randomSeedString: string
    width?: number
    height?: number
}

export default function WordCloud({filterKey, randomSeedString, width = 500, height = 300}: Props) {
    const {tooltipRef} = useContext(TooltipContext)

    const [isMounted, setIsMounted] = useState(false)

    // d3-cloud requires the DOM to be loaded before it can render
    useEffect(() => {
        setIsMounted(true)
    }, [setIsMounted])

    if (!filterKey || !randomSeedString) return null

    const results = dataset.reduce((acc, obj) => {
        const filterValue = obj[filterKey as keyof typeof obj]

        if (Array.isArray(filterValue)) {
            filterValue.forEach((item: any) => {
                if (!acc[item]) {
                    acc[item] = []
                }

                acc[item].push(obj.GrantID);
            })
        }

        return acc
    }, {} as {[key: string]: number[]})

    const data = Object.keys(results).map((key) => ({
        text: key,
        value: results[key as keyof typeof results].length * 75
    }))

    // Ensures the word cloud displays the same on page refresh
    const fixedRandom = seedrandom(randomSeedString)

    const fullConfig: any = resolveConfig(tailwindConfig)
    const tailwindColours = fullConfig.theme.colors

    const colours = [
        tailwindColours.slate['500'],
        tailwindColours.amber['500'],
        tailwindColours.emerald['500'],
        tailwindColours.sky['500'],
        tailwindColours.indigo['500'],
        tailwindColours.fuchsia['500'],
        tailwindColours.rose['500'],
    ]

    const onWordMouseOver = (event: MouseEvent<SVGPathElement>, data: any) => {
        tooltipRef?.current?.open({
            position: {
                x: event.clientX,
                y: event.clientY,
            },
            content: <TooltipContent data={data} />,
        })
    }

    const onWordMouseOut = () => {
        tooltipRef?.current?.close()
    }

    return isMounted ?
        <WordCloudComponent
            data={data}
            width={width}
            height={height}
            rotate={0}
            fill={(_, index) => colours[index % colours.length]}
            font={font.style.fontFamily}
            random={fixedRandom.quick}
            onWordMouseOver={onWordMouseOver}
            onWordMouseOut={onWordMouseOut}
        />
        : null
}

function TooltipContent({data}: any) {
    return (
        <div className="flex flex-col">
            <p className="text-lg font-bold">{data.text}</p>
            <p className="text-md">{data.value} grants</p>
        </div>
    )
}
