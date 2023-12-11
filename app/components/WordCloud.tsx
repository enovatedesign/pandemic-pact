"use client"

import {useState, useEffect, useContext, MouseEvent} from "react"
import seedrandom from 'seedrandom'
import WordCloudComponent from 'react-d3-cloud'
import {GlobalFilterContext} from "../helpers/filter"
import {TooltipContext} from '../helpers/tooltip'
import {dollarValueFormatter} from "../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import font from '../globals/font'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'
import selectOptions from '../../data/dist/select-options.json'

interface Props {
    filterKey: string
    randomSeedString: string
    width?: number
    height?: number
}

export default function WordCloud({filterKey, randomSeedString, width = 500, height = 300}: Props) {
    const {tooltipRef} = useContext(TooltipContext)
    const {grants: globalGrants} = useContext(GlobalFilterContext)

    const [isMounted, setIsMounted] = useState(false)

    // d3-cloud requires the DOM to be loaded before it can render
    useEffect(() => {
        setIsMounted(true)
    }, [setIsMounted])

    if (!filterKey || !randomSeedString) return null

    const data = selectOptions[filterKey as keyof typeof selectOptions].map(function ({value, label}) {
        const grants = globalGrants.filter(
            (grant: any) => grant[filterKey].includes(value)
        )

        const moneyCommitted = grants.reduce(...sumNumericGrantAmounts)

        return {
            text: label,
            value: grants.length * 0.25,
            "Total Number Of Grants": grants.length,
            "Amount Committed": moneyCommitted,
        }
    })

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
            <p className="text-md">Grants: {data['Total Number Of Grants']}</p>
            <p className="text-md">Amount Committed: {dollarValueFormatter(data['Amount Committed'] || 0)}</p>
        </div>
    )
}
