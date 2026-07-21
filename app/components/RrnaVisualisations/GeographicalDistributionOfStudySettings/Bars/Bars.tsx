"use client"

import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    BarChart as RechartBarChart,
    Bar,
    Tooltip,
} from 'recharts'
import { useSpring, animated } from '@react-spring/web'
import { RrnaFilterContext } from '@/app/helpers/filters'
import { brandColours, rrnaRegionColours } from '@/app/helpers/colours'
import BackToParentButton from '@/app/components/BackToParentButton'
import {
    prepareGeographicalDistributionOfStudySubjectBarChartData,
    prepareCountryDrilldownData,
} from '../helpers'

const BAR_HEIGHT = 59

interface SelectedRegion {
    id: string
    label: string
}

export default function Bars() {
    const { studies } = useContext(RrnaFilterContext)
    const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null)

    const chartData = useMemo(
        () =>
            selectedRegion
                ? prepareCountryDrilldownData(studies, selectedRegion.id)
                : prepareGeographicalDistributionOfStudySubjectBarChartData(studies),
        [studies, selectedRegion]
    )

    const highestValue = useMemo(
        () => Math.max(...chartData.map((d) => d.numberOfStudies), 1),
        [chartData]
    )

    const [springs, api] = useSpring(() => ({
        from: { opacity: 0, y: 16 },
        to: { opacity: 1, y: 0 },
        config: { tension: 220, friction: 24 },
    }))

    useEffect(() => {
        api.start({
            from: { opacity: 0, y: 16 },
            to: { opacity: 1, y: 0 },
        })
    }, [selectedRegion, api])

    const animationKey = selectedRegion?.id ?? 'root'

    return (
        <div className="w-full">
            {selectedRegion && (
                <div className="mb-4">
                    <BackToParentButton
                        label={`Back to WHO Regions (${selectedRegion.label})`}
                        onClick={() => setSelectedRegion(null)}
                    />
                </div>
            )}

            <animated.div style={springs}>
                {chartData.map((entry, index) => (
                    <Fragment key={entry.label}>
                        <p className="text-sm text-gray-600 mt-2">{entry.label}</p>
                        <div className="grid grid-cols-12">
                            <ResponsiveContainer
                                width="100%"
                                height={BAR_HEIGHT}
                                className="col-span-11"
                            >
                                <RechartBarChart
                                    key={`${animationKey}-${index}`}
                                    data={[entry]}
                                    layout="vertical"
                                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                >
                                    <XAxis type="number" hide={true} domain={[0, highestValue]} />
                                    <YAxis type="category" dataKey="label" hide={true} />
                                    <Tooltip
                                        content={({ payload }) => {
                                            if (!payload?.[0]) return null
                                            return (
                                                <div className="bg-white rounded-lg text-sm border shadow border-gray-100 px-3 py-2">
                                                    <p className="font-medium text-gray-700">{entry.label}</p>
                                                    <p className="text-gray-500">{payload[0].value} studies</p>
                                                </div>
                                            )
                                        }}
                                        animationDuration={0}
                                        wrapperStyle={{ zIndex: 1 }}
                                        cursor={false}
                                    />
                                    <Bar
                                        dataKey="numberOfStudies"
                                        fill={selectedRegion
                                            ? rrnaRegionColours[selectedRegion.label] ?? brandColours.blue['400']
                                            : rrnaRegionColours[entry.label] ?? brandColours.blue['400']
                                        }
                                        barSize={BAR_HEIGHT}
                                        background={{ fill: '#eee' }}
                                        isAnimationActive={true}
                                        animationDuration={600}
                                        animationEasing="ease-out"
                                        animationBegin={index * 40}
                                        onClick={() => {
                                            if (!selectedRegion && 'region' in entry) {
                                                setSelectedRegion({
                                                    id: (entry as any).region,
                                                    label: entry.label,
                                                })
                                            }
                                        }}
                                        cursor={!selectedRegion ? 'pointer' : 'default'}
                                    />
                                </RechartBarChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-gray-600 flex items-center pl-2">
                                {entry.numberOfStudies}
                            </p>
                        </div>
                    </Fragment>
                ))}

                {!selectedRegion && chartData.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                        Click a region to explore countries
                    </p>
                )}
            </animated.div>
        </div>
    )
}
