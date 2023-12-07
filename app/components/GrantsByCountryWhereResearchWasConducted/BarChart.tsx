import {useState, useContext} from "react"
import {Icon, Subtitle} from "@tremor/react"
import {InformationCircleIcon, ArrowLeftIcon} from "@heroicons/react/solid";
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts'
import {groupBy} from 'lodash'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {GlobalFilterContext} from "../../helpers/filter"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import iso2aToCountryNameMapping from '../../../data/source/iso2a-to-country-name-mapping.json'

type Iso2aCode = keyof typeof iso2aToCountryNameMapping

export default function BarChart() {
    const {grants: dataset} = useContext(GlobalFilterContext)

    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

    const colours = [
        '#3b82f6',
        '#f59e0b',
        '#6b7280',
        '#ef4444',
        '#71717a',
        '#64748b',
        '#22c55e',
        '#14b8a6',
        '#10b981',
        '#ec4899',
        '#f43f5e',
        '#0ea5e9',
        '#a855f7',
        '#eab308',
        '#737373',
        '#6366f1',
        '#d946ef',
        '#06b6d4',
        '#84cc16',
        '#8b5cf6',
        '#f97316',
        '#78716c',
    ]

    let data: any = []

    if (selectedRegion) {
        data = Object.entries(
            groupBy(
                dataset.filter((grant: any) => grant.ResearchInstitutionRegion === selectedRegion),
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
            'Amount Committed': grants.reduce(...sumNumericGrantAmounts),
        }
    })

    type DataPoint = {
        country: string
        'Amount Committed': number
    }

    data = data.sort(
        (a: DataPoint, b: DataPoint) => b['Amount Committed'] - a['Amount Committed']
    )

    const stacks = Object.keys(data[0]).filter(key => key !== 'country')

    const handleIconClick = () => {
        if (selectedRegion) {
            return setSelectedRegion(null)
        }
    }

    const handleBarClick = (event: any) => {
        if (!event?.activeLabel) {
            return
        }

        const totalGrantsInClickedRegion = dataset.filter((grant: any) => grant.ResearchInstitutionRegion === event.activeLabel).length

        if (totalGrantsInClickedRegion > 0) {
            setSelectedRegion(event.activeLabel)
        }
    }

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

                <Subtitle className="text-gray-500">
                    {selectedRegion ? `Viewing Countries in ${selectedRegion}.` : 'Click a region bar to expand to countries'}
                </Subtitle>
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
                            tickFormatter={dollarValueFormatter}
                        />

                        <YAxis
                            dataKey="country"
                            type="category"
                            width={100}
                            tickFormatter={(label: string) => selectedRegion ? iso2aToCountryNameMapping[label as Iso2aCode] : label}
                        />

                        <Tooltip
                            formatter={dollarValueFormatter}
                            labelFormatter={(label: string) => selectedRegion ? iso2aToCountryNameMapping[label as Iso2aCode] : label}
                            isAnimationActive={false}
                            cursor={{fill: 'transparent'}}
                        />

                        {stacks.map((stack, index) => (
                            <Bar
                                key={index}
                                dataKey={stack}
                                stackId="a"
                                fill={colours[index]}
                                cursor={selectedRegion ? 'default' : 'pointer'}
                            />
                        ))}
                    </RechartBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
