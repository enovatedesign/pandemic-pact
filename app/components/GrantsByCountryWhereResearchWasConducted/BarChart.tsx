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
import { baseTooltipProps } from '../../helpers/tooltip'
import DoubleLabelSwitch from '../DoubleLabelSwitch'

export default function BarChart() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [usingFunderLocation, setUsingFunderLocation] =
        useState<boolean>(false)

    let data: any[] = []

    if (selectedRegion) {
        data = Object.entries(
            groupBy(
                dataset.filter((grant: any) =>
                    grant.ResearchInstitutionRegion.includes(selectedRegion)
                ),
                'ResearchInstitutionCountry'
            )
        )
    } else {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(
            dataset,
            usingFunderLocation ? 'FunderRegion' : 'ResearchInstitutionRegion'
        )

        data = whoRegions.map(region => [
            region,
            grantsGroupedByRegion[region] ?? [],
        ])
    }

    data = data.map(([country, grants]: [string, any]) => {
        return {
            country,
            'Known Financial Commitments': grants.reduce(
                ...sumNumericGrantAmounts
            ),
        }
    })

    type DataPoint = {
        country: string
        'Known Financial Commitments': number
    }

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
            grant.ResearchInstitutionRegion.includes(event.activeLabel)
        ).length

        if (totalGrantsInClickedRegion > 0) {
            setSelectedRegion(event.activeLabel)
        }
    }

    const countryOrRegionFormatter = (label: string) => {
        return selectOptions[
            selectedRegion
                ? 'ResearchInstitutionCountry'
                : 'ResearchInstitutionRegion'
        ].find(option => option.value === label)?.label as string
    }

    const selectedRegionName = selectOptions.ResearchInstitutionRegion.find(
        option => option.value === selectedRegion
    )?.label

    return (
        <div className="w-full">
            <div className="flex justify-center items-center gap-x-2">
                <button onClick={handleIconClick} className="flex items-center">
                    {selectedRegion ? (
                        <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                            <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                        </span>
                    ) : (
                        <span className="cursor-default">
                            <InformationCircleIcon className="size-7 text-brand-grey-500" />
                        </span>
                    )}
                </button>

                <p className="text-brand-grey-500">
                    {selectedRegion
                        ? `Viewing Countries in ${selectedRegionName}.`
                        : 'Click a region bar to expand to countries'}
                </p>
            </div>

            <div className="w-full mt-4 flex flex-col gap-y-4">
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
                            formatter={dollarValueFormatter}
                            labelFormatter={countryOrRegionFormatter}
                            isAnimationActive={false}
                            cursor={{ fill: 'transparent' }}
                            {...baseTooltipProps}
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
                <div className="self-center">
                    <DoubleLabelSwitch
                        checked={usingFunderLocation}
                        onChange={setUsingFunderLocation}
                        leftLabel="Research Institution"
                        rightLabel="Funder"
                        screenReaderLabel="Using Funder Location"
                    />
                </div>
            </div>
        </div>
    )
}
