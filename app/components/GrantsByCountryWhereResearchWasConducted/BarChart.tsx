import { useState, useContext } from 'react'
import { InformationCircleIcon, ArrowLeftIcon } from '@heroicons/react/solid'
import {
    BarChart as RechartBarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { groupBy } from 'lodash'
import {
    dollarValueFormatter,
    axisDollarFormatter,
} from '../../helpers/value-formatters'
import { GlobalFilterContext } from '../../helpers/filters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { regionColours } from '../../helpers/colours'
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import selectOptions from '../../../data/dist/select-options.json'
import { rechartBaseTooltipProps } from '../../helpers/tooltip'
import DoubleLabelSwitch from '../DoubleLabelSwitch'
import TooltipContent from '../TooltipContent'
import NoDataText from '../NoData/NoDataText'
import { grantsPerResearchCategoryByRegionBarsFallback } from '../NoData/visualisationFallbackData'

type DataPoint = {
    country: string
    'Known Financial Commitments': number
}

export default function BarChart({
    countryField = 'FunderRegion',
    regionField = 'ResearchInstitutionRegion'
}: {
    countryField?: string,
    regionField?: string
}) {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [usingFunderLocation, setUsingFunderLocation] = useState<boolean>(false)

    let data: any[] = []

    if (selectedRegion) {
        let grantsGroupedByCountry: any = {}

        const countriesInSelectedRegion =
            regionToCountryMapping[
                selectedRegion as keyof typeof regionToCountryMapping
            ]

        dataset.forEach((grant: any) => {
            grant[countryField].forEach((country: string) => {
                if (!countriesInSelectedRegion.includes(country)) {
                    return
                }

                if (grantsGroupedByCountry[country]) {
                    grantsGroupedByCountry[country].push(grant)
                } else {
                    grantsGroupedByCountry[country] = [grant]
                }
            })
        })

        data = Object.entries(grantsGroupedByCountry)
    } else {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(
            dataset,
            usingFunderLocation ? countryField : regionField
        )

        data = whoRegions.map(region => [
            region,
            grantsGroupedByRegion[region] ?? [],
        ])
    }

    data = data.map(([country, grants]: [string, any]) => {
        return {
            country,
            'Known Financial Commitments': grants.map((grant: any) => ({
                ...grant,
                GrantAmountConverted: Number(grant['GrantAmountConverted'])
            })).reduce(
                ...sumNumericGrantAmounts
            ),
            'Number of Grants': grants.length
        }
    })

    data = data.sort(
        (a: DataPoint, b: DataPoint) =>
            b['Known Financial Commitments'] - a['Known Financial Commitments']
    )

    const handleIconClick = () => {
        if (selectedRegion) {
            return setSelectedRegion(null)
        }
    }

    const handleBarClick = (event: any) => {
        if (!event?.activeLabel) {
            return
        }

        const totalGrantsInClickedRegion = dataset.filter((grant: any) =>
            grant[regionField].includes(event.activeLabel)
        ).length

        if (totalGrantsInClickedRegion > 0) {
            setSelectedRegion(event.activeLabel)
        }
    }

    const countryOrRegionFormatter = (label: string) => {
        const key = selectedRegion ? countryField : regionField
        return selectOptions[key as keyof typeof selectOptions]
            .find(option => option.value === label)?.label as string
    }

    const tooltipContent = (props: any) => {
        const title = countryOrRegionFormatter(props.label)

        const items = [
            {
                label: 'Known Financial Commitments (USD)',
                value: dollarValueFormatter(props.payload[0]?.value),
            },
            {
                label: 'Number of Grants',
                value: props.payload[0]?.payload['Number of Grants']
            }
        ];

        return <TooltipContent title={title} items={items} />
    }

    const selectedRegionName = selectOptions.ResearchInstitutionRegion.find(
        option => option.value === selectedRegion
    )?.label
    
    const dataIsNotAvailable = data.every(dataPoint => (
        dataPoint['Known Financial Commitments'] === 0 &&
        dataPoint['Number of Grants'] === 0
    ));
    
    if (dataIsNotAvailable || data.length === 0) {
        data = grantsPerResearchCategoryByRegionBarsFallback
    }

    const responsiveContainerWrapper = [
        'w-full mt-4 flex flex-col gap-y-4',
        data === grantsPerResearchCategoryByRegionBarsFallback && 'blur-md'
    ].filter(Boolean).join(' ')
    
    return (
        <div className="w-full">
            <div className="flex justify-center items-center gap-x-2 ignore-in-image-export">
                <button onClick={handleIconClick} className="flex items-center">
                    {selectedRegion ? (
                        <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                            <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                        </span>
                    ) : (
                        <span className="cursor-default">
                            <InformationCircleIcon className="size-7 text-brand-grey-500 ignore-in-image-export" />
                        </span>
                    )}
                </button>

                <p className="text-brand-grey-500">
                    {selectedRegion
                        ? `Viewing Countries in ${selectedRegionName}.`
                        : 'Click a region bar to expand to countries'}
                </p>
            </div>
            
            <div className="w-full relative">
                <div className={responsiveContainerWrapper}>
                    <ResponsiveContainer width="100%" height={500}>
                        <RechartBarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 50, left: 20, bottom: 20 }}
                            onClick={handleBarClick}
                        >
                            <XAxis
                                type="number"
                                tickFormatter={axisDollarFormatter}
                                label={{
                                    value: 'Known Financial Commitments (USD)',
                                    position: 'bottom',
                                    offset: 0,
                                }}
                            />

                            <YAxis
                                dataKey="country"
                                type="category"
                                width={100}
                                tickFormatter={countryOrRegionFormatter}
                            />

                            <Tooltip
                                content={tooltipContent}
                                cursor={{ fill: 'transparent' }}
                                {...rechartBaseTooltipProps}
                            />

                            <Bar
                                dataKey="Known Financial Commitments"
                                cursor={selectedRegion ? 'default' : 'pointer'}
                            >
                                {data.map(({ country }) => (
                                    <Cell
                                        key={`cell-${country}`}
                                        fill={
                                            selectedRegion
                                                ? regionColours[selectedRegion]
                                                : regionColours[country]
                                        }
                                    />
                                ))}
                            </Bar>
                        </RechartBarChart>
                    </ResponsiveContainer>
                
                    <div className="self-center ignore-in-image-export">
                        <DoubleLabelSwitch
                            checked={usingFunderLocation}
                            onChange={setUsingFunderLocation}
                            leftLabel="Research Location"
                            rightLabel="Funder"
                            screenReaderLabel="Using Funder Location"
                        />
                    </div>
                </div>
                
                {(dataIsNotAvailable || data.length === 0) && <NoDataText />}

            </div>
        </div>
    )
}
