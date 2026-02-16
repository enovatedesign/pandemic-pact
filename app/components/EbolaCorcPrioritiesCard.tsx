import { useContext, useMemo } from 'react'
import Link from 'next/link'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { flatMap, groupBy, sumBy } from 'lodash'

import { subPriorityLabels } from '../../scripts/helpers/ebola-corc-label-mapping'
import { GlobalFilterContext } from '../helpers/filters'
import { dollarValueFormatter } from '../helpers/value-formatters'

import VisualisationCard from "./VisualisationCard"
import InfoModal from './InfoModal'

type ChartData = Array<{
    label: string, 
    value: number 
}>

type Priority = {
    priorityValue: number
    label: string
}

type SubPriority = {
    priorityValue: number
    subPriorityValue: number
    label: string
}


const EbolaCorcPrioritiesCard = () => {
    const { grants } = useContext(GlobalFilterContext)
    
    const { 
        corcGrants, 
        grantsGroupedByPriority ,
    } = useMemo(() => {
        const corcGrants = grants.filter(grant => 
            grant['EbolaCorcPriorityGrant'] && // Check that this is a corc priority grant
            grant['CorcPriorities'] // Ensure that the corc priority data is present
        )
        
        // For each priority on the grant, create a separate entry for that grant-priority combination
        // This allows counting the total number of grants for each priority
        // This provides grouping and seperation for the priorities
        const grantsByPriority = flatMap(corcGrants, grant =>
            (grant['CorcPriorities']?.priorities || []).map((priority: Priority) => ({
                ...grant,
                priorityValue: priority['priorityValue'],
                priorityLabel: priority['label'],
            }))
        )
        
        return {
            corcGrants,
            grantsGroupedByPriority: groupBy(grantsByPriority, 'priorityValue'),
        }
    }, [grants])

    const subtitle = (
        <p>
            Research priorities as outlined in Filoviridae CORC  Scientific Consultation Report - <Link href="https://cdn.who.int/media/docs/default-source/consultation-rdb/ebola-outbreak-10-priorities_filovirus-corc_final.pdf?sfvrsn=5fc0e62d_4" target="_blank" rel="noopener noreferrer">10 Research Priorities in Response to the Ebola Outbreak in DR Congo and Future Filovirus Preparedness</Link>
        </p>
    )

    return (
        <VisualisationCard
            id="ebola-research-priorities"
            title="Ebola Research priorities"
            subtitle={subtitle}
            footnote="Please note: Some grants map to more than one priority area. The list of research areas was developed in consultation with the Filoviridae CORC.  Greyed-out area under “Accelerate Clinical Trial Approvals and Regulatory Preparedness” included implementation actions rather than research priorities. Therefore, no grants were mapped to this area."
        >
            <ul className="flex flex-col space-y-2 justify-center divide-y divide-primary">
                {Object.entries(grantsGroupedByPriority).map(([priorityValue, allGrants]) => {
                    // Get the count of all grants. In the data, 
                    // Priority value 3 is recorded as 'NA', 
                    // We need to build this relational data for use here and override the count to 0
                    const grantCount = Number(priorityValue) === 3 ? 0 : allGrants.length

                    // Retrieve the priority label for this priority
                    const priorityLabel = allGrants[0]['CorcPriorities'].priorities?.find(
                        (priority: Priority) => priority['priorityValue'] === Number(priorityValue)
                    )?.label ?? ''

                    // build the priority grant count chart data
                    const priorityCountData: ChartData = [{ label: priorityLabel, value: grantCount }]
                    
                    // Using the corc priority grants, find the related grants using the priority value and add the amount converted together
                    // We cannot use the grants grouped by priority as this contains duplicates
                    // Priority value 3 is recorded as 'NA', 
                    // We need to build this relational data for use here and override the count to 0
                    const priorityTotalAmountConverted = Number(priorityValue) === 3 ? 0 : sumBy(
                        corcGrants.filter(grant => 
                            grant['CorcPriorities'].priorities.some(
                                (priority: Priority) => priority['priorityValue'] === Number(priorityValue)
                            )
                        ), 
                        'GrantAmountConverted'
                    )

                    const priorityCommitmentData: ChartData = [{ label: priorityLabel, value: priorityTotalAmountConverted}]

                    const allSubPriorityData = Object.entries(subPriorityLabels[Number(priorityValue)] || {}).map(
                        ([subPriorityValue, label]) => {
                            const subPriorityValueNum = Number(subPriorityValue)

                            // Filter grants that have this sub-priority
                            const relatedGrants = allGrants.filter(grant =>
                                (grant['CorcPriorities']?.subPriorities || []).some((subPriority: SubPriority) => 
                                    subPriority['priorityValue'] === Number(priorityValue) &&
                                    subPriority['subPriorityValue'] === subPriorityValueNum
                                )
                            )

                            // Count of grants for this sub-priority
                            const count = relatedGrants.length

                            // Total amount committed for this sub-priority
                            const totalAmountConverted = sumBy(relatedGrants, 'GrantAmountConverted')

                            return {
                                label,
                                count,
                                totalAmountConverted
                            }
                        }
                    )

                    // Calculate the maximum value of the count of the priority data and the sub priority data
                    const countDomain = Math.max(...[
                        priorityCountData[0].value, 
                        ...allSubPriorityData.map(subPriorityData => subPriorityData.count)
                    ])

                    const amountConvertedDomain = Math.max(
                        priorityCommitmentData[0].value,
                        ...allSubPriorityData.map(subPriorityData => subPriorityData.totalAmountConverted)
                    )
                    
                    return (
                        <li key={priorityValue} className="space-y-2">
                            <div className="grid grid-cols-5 pt-6">
                                <div className="col-start-2 col-span-4 grid grid-cols-3 gap-x-4">
                                    <p className="col-start-2 text-brand-grey-500">
                                        Number of grants
                                    </p>

                                    <div className="flex gap-x-1">
                                        <p className="text-brand-grey-500">
                                            Known Financial Commitments (USD)
                                        </p>
                                        <InfoModal>
                                            <p>
                                                We used historical currency exchange rates from any currency in which the grant was awarded converted to the US dollars. The term &apos;known&apos; is used as not all grant records have funding amount data.
                                            </p>
                                        </InfoModal>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 pb-6">
                                <p className="max-md:col-span-4 max-md:border-b max-md:mb-4 max-md:pb-4 md:flex md:items-center md:justify-center">
                                    {priorityValue}
                                </p>

                                <ul className="col-span-4 space-y-6 md:space-y-3">
                                    <li className="grid gap-y-4 md:grid-cols-3 md:gap-x-4">
                                        <h3>{priorityLabel}</h3>

                                        <div className="flex items-center gap-x-2">
                                            <SingleBar 
                                                chartData={priorityCountData} 
                                                domain={countDomain}
                                            />

                                            <p className="text-xs text-gray-600">
                                                {grantCount}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-x-2">
                                            <SingleBar 
                                                chartData={priorityCommitmentData} 
                                                domain={amountConvertedDomain}
                                            />

                                            <p className="text-sm text-gray-600">
                                                {dollarValueFormatter(priorityTotalAmountConverted)}
                                            </p>
                                        </div>
                                    </li>
                                    
                                    {allSubPriorityData.map(({ label, count, totalAmountConverted }) => {
                                        const subPriorityCountdata: ChartData = [{ label, value: count }]
                                        const subPriorityTotalKnownAmountCommitted: ChartData = [{ label, value: totalAmountConverted }]
                                        
                                        return (
                                            <li key={label} className="grid gap-y-4 md:grid-cols-3 md:gap-x-4">
                                                <h3>{label}</h3>

                                                <div className="flex items-center gap-x-2">
                                                    <SingleBar 
                                                        chartData={subPriorityCountdata} 
                                                        domain={countDomain}
                                                    />

                                                    <p className="text-xs text-gray-600">
                                                        {count}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-x-2">
                                                    <SingleBar 
                                                        chartData={subPriorityTotalKnownAmountCommitted} 
                                                        domain={amountConvertedDomain}
                                                    />

                                                    <p className="text-sm text-gray-600">
                                                        {dollarValueFormatter(totalAmountConverted)}
                                                    </p>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </VisualisationCard>
    )
}

export default EbolaCorcPrioritiesCard

interface SingleBarProps {
    chartData: ChartData, 
    domain: number
}

const SingleBar = ({ 
    chartData, 
    domain, 
}: SingleBarProps) => {
    return (
        <ResponsiveContainer width="100%" height={20}>
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                }}
            >
                <XAxis type="number" hide domain={[0, domain]}/>
                <YAxis type="category" dataKey="label" hide />
                <Bar dataKey="value" fill="#7577CC" background={{ fill: '#eee' }}/>
            </BarChart>
        </ResponsiveContainer>
    )
}