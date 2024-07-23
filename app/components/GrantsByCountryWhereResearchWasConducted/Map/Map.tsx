import { useState, useMemo, useContext } from 'react'
import { useRouter } from 'next/navigation'
import TooltipContent from '../../TooltipContent'
import { scaleLog } from 'd3-scale'
import { GlobalFilterContext } from '../../../helpers/filters'
import countryGeojson from '../../../../public/data/geojson/countries.json'
import whoRegionGeojson from '../../../../public/data/geojson/who-regions.json'
import { dollarValueFormatter } from '../../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../../helpers/reducers'
import { TooltipContext } from '../../../helpers/tooltip'
import { brandColours } from '../../../helpers/colours'
import selectOptions from '../../../../data/dist/select-options.json'
import InteractiveMap from './InteractiveMap'
import MapControls from './MapControls'
import type { MapControlState } from './types'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const { tooltipRef } = useContext(TooltipContext)

    const router = useRouter()

    const [mapControlState, setMapControlState] = useState<MapControlState>({
        displayKnownFinancialCommitments: false,
        displayWhoRegions: false,
        locationType: 'Funder',
    })

    const onMouseEnterOrMove = (
        position: { x: number; y: number },
        properties: any,
    ) => {
        tooltipRef?.current?.open({
            position,
            content: (
                <MapTooltipContent
                    properties={properties}
                    displayWhoRegions={mapControlState.displayWhoRegions}
                />
            ),
        })
    }

    const onMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const onClick = (properties: any) => {
        const queryFilters = {
            [grantField]: [properties.id],
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    const grantField =
        mapControlState.locationType +
        (mapControlState.displayWhoRegions ? 'Region' : 'Country')

    const [geojson, colourScale] = useMemo(() => {
        const geojson = mapControlState.displayWhoRegions
            ? { ...whoRegionGeojson }
            : { ...countryGeojson }

        geojson.features = geojson.features.map((feature: any) => {
            const id = feature.properties.id

            const name = selectOptions[
                grantField as keyof typeof selectOptions
            ].find(option => option.value === id)?.label

            const grants = dataset.filter(grant =>
                grant[grantField].includes(id),
            )

            const totalGrants = grants.length

            const totalAmountCommitted = grants.reduce(
                ...sumNumericGrantAmounts,
            )

            return {
                ...feature,
                properties: {
                    id,
                    name,
                    totalGrants,
                    totalAmountCommitted,
                },
            }
        })

        const key = mapControlState.displayKnownFinancialCommitments
            ? 'totalAmountCommitted'
            : 'totalGrants'

        const allTotalGrants = geojson.features
            .filter((country: any) => country.properties[key])
            .map((country: any) => country.properties[key])

        const colourScale = scaleLog<string>()
            .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        geojson.features = geojson.features.map((feature: any) => {
            const value = feature.properties[key] ?? null

            const colour = value ? colourScale(value) : '#D6D6DA'

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    colour,
                },
            }
        })

        return [geojson, colourScale]
    }, [dataset, mapControlState, grantField])

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <InteractiveMap
                    geojson={geojson}
                    onMouseEnterOrMove={onMouseEnterOrMove}
                    onMouseLeave={onMouseLeave}
                    onClick={onClick}
                />
            </div>

            <MapControls
                mapControlState={mapControlState}
                setMapControlState={setMapControlState}
                colourScale={colourScale}
            />
        </div>
    )
}

function MapTooltipContent({
    properties,
    displayWhoRegions,
}: {
    properties: any
    displayWhoRegions: boolean
}) {
    const items = [
        {
            label: 'Grants',
            value: properties.totalGrants || 0,
        },
        {
            label: 'Known Financial Commitments (USD)',
            value: dollarValueFormatter(properties.totalAmountCommitted || 0),
        },
    ]

    return (
        <TooltipContent
            title={properties.name}
            items={items}
            footer={
                <div className="px-4 py-2">
                    <p className="text-right text-sm text-gray-400">
                        Click to explore grants in this{' '}
                        {displayWhoRegions ? 'region' : 'country'}
                    </p>
                </div>
            }
        />
    )
}
