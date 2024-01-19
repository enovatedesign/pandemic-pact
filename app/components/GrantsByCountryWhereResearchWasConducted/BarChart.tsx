import {useState, useContext} from "react"
import {Icon} from "@tremor/react"
import {InformationCircleIcon, ArrowLeftIcon} from "@heroicons/react/solid";
import {BarChart as RechartBarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts'
import {groupBy} from 'lodash'
import {dollarValueFormatter, axisDollarFormatter} from "../../helpers/value-formatters"
import {GlobalFilterContext} from "../../helpers/filter"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {regionColours} from "../../helpers/colours"
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import selectOptions from '../../../data/dist/select-options.json'
import {baseTooltipProps} from "../../helpers/tooltip"

export default function BarChart() {
    const {grants: dataset} = useContext(GlobalFilterContext)

    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

    let data: any[] = []

    if (selectedRegion) {
        data = Object.entries(
            groupBy(
                dataset.filter((grant: any) => grant.ResearchInstitutionRegion.includes(selectedRegion)),
                'ResearchInstitutionCountry',
            )
        )
    } else {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(dataset, 'ResearchInstitutionRegion')

        data = whoRegions.map(region => [
            region,
            grantsGroupedByRegion[region] ?? [],
        ])
    }

    data = data.map(([country, grants]: [string, any]) => {
        return {
            country,
            'Known Financial Commitments': grants.reduce(...sumNumericGrantAmounts),
        }
    })

    type DataPoint = {
        country: string
        'Known Financial Commitments': number
    }

    data = data.sort(
        (a: DataPoint, b: DataPoint) => b['Known Financial Commitments'] - a['Known Financial Commitments']
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

        const totalGrantsInClickedRegion = dataset.filter((grant: any) => grant.ResearchInstitutionRegion.includes(event.activeLabel)).length

        if (totalGrantsInClickedRegion > 0) {
            setSelectedRegion(event.activeLabel)
        }
    }

    const countryOrRegionFormatter = (label: string) => {
        return (selectOptions[
            selectedRegion ? 'ResearchInstitutionCountry' : 'ResearchInstitutionRegion'
        ].find(option => option.value === label)?.label) as string
    }

    const selectedRegionName = selectOptions.ResearchInstitutionRegion.find(option => option.value === selectedRegion)?.label

    return (
        <div className="w-full">
            <div className="flex justify-center items-center">
                <Icon
                    size={selectedRegion ? 'md' : 'lg'}
                    icon={selectedRegion ? ArrowLeftIcon : InformationCircleIcon}
                    className={selectedRegion ? 'cursor-pointer mr-4' : 'cursor-default'}
                    variant={selectedRegion ? 'shadow' : 'simple'}
                    color="slate"
                    onClick={handleIconClick}
                />

                <p className="text-gray-500">
                    {selectedRegion ? `Viewing Countries in ${selectedRegionName}.` : 'Click a region bar to expand to countries'}
                </p>
            </div>

            <div className="w-full h-[600px] mt-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <RechartBarChart
                        data={data}
                        layout="vertical"
                        margin={{top: 5, right: 50, left: 20, bottom: 5}}
                        onClick={handleBarClick}
                    >
                        <XAxis
                            type="number"
                            tickFormatter={axisDollarFormatter}
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
                            cursor={{fill: 'transparent'}}
                            {...baseTooltipProps}
                        />

                        <Bar
                            dataKey="Known Financial Commitments"
                            cursor={selectedRegion ? 'default' : 'pointer'}
                        >
                            {
                                data.map(({country}) => (
                                    <Cell
                                        key={`cell-${country}`}
                                        fill={selectedRegion ? regionColours[selectedRegion] : regionColours[country]}
                                    />
                                ))
                            }
                        </Bar>
                    </RechartBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
