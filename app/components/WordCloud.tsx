"use client"

import {useState, useEffect, useContext, MouseEvent} from "react"
import seedrandom from 'seedrandom'
import WordCloudComponent from 'react-d3-cloud'
import {GlobalFilterContext} from "../helpers/filter"
import {TooltipContext} from '../helpers/tooltip'
import {dollarValueFormatter} from "../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import font from '../globals/font'
import {Colours} from '../helpers/colours'
import selectOptions from '../../data/dist/select-options.json'

interface Props {
    filterKey: string
    randomSeedString: string
    colours: Colours
    width?: number
    height?: number
}

export default function WordCloud({filterKey, randomSeedString, colours, width = 500, height = 300}: Props) {
    const {tooltipRef} = useContext(TooltipContext)
    const {grants: globalGrants} = useContext(GlobalFilterContext)

    const [isMounted, setIsMounted] = useState(false)

    // d3-cloud requires the DOM to be loaded before it can render
    useEffect(() => {
        setIsMounted(true)
    }, [setIsMounted])

    if (!filterKey || !randomSeedString) return null

    const data = selectOptions[filterKey as keyof typeof selectOptions].map(function ({value: categoryValue, label}) {
        const grants = globalGrants.filter(
            (grant: any) => grant[filterKey].includes(categoryValue)
        )

        const moneyCommitted = grants.reduce(...sumNumericGrantAmounts)

        return {
            categoryValue,
            text: label,
            value: grants.length * 0.25,
            "Total Number Of Grants": grants.length,
            "Known Financial Commitments": moneyCommitted,
        }
    }).sort((a: any, b: any) => a.value - b.value)

    // Ensures the word cloud displays the same on page refresh
    const fixedRandom = seedrandom(randomSeedString)

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
            fill={(d: any) => colours[d.categoryValue]}
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
            <p className="text-md">Known Financial Commitments: {dollarValueFormatter(data['Known Financial Commitments'] || 0)}</p>
        </div>
    )
}
