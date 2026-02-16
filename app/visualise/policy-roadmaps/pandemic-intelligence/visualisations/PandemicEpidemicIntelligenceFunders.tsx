"use client"

import { useContext, useMemo, useState } from 'react'
import Image from 'next/image'
import { groupBy, sumBy } from 'lodash'

import selectOptions from '../../../../../data/dist/select-options.json'
import { dollarValueFormatter } from '@/app/helpers/value-formatters'
import { GlobalFilterContext, SidebarStateContext } from '@/app/helpers/filters'

import VisualisationCard from '@/app/components/VisualisationCard'
import DoubleLabelSwitch from '@/app/components/DoubleLabelSwitch'

const PandemicEpidemicIntelligenceFunders = () => {
    const { grants } = useContext(GlobalFilterContext)
    const { sidebarOpen } = useContext(SidebarStateContext)
    const [activeThemeValue, setActiveThemeValue] = useState<string>('1')
    const [orderByAmount, setOrderByAmount] = useState<boolean>(true)

    const allThemes = selectOptions['PandemicIntelligenceThemes']
    const allFunders = selectOptions['FundingOrgName']

    const {
        relatedFunders,
        activeThemeLabel
    } = useMemo(() => {
        const activeThemeLabel = allThemes.find(({ value }) => value === activeThemeValue)?.label ?? ''
        const relatedGrants = grants.filter(grant =>
            grant['PandemicIntelligenceThemes'].includes(activeThemeValue)
        )

        const relatedGrantsGroupedByFunder = groupBy(relatedGrants, 'FundingOrgName')

        const relatedFunders = Object.entries(relatedGrantsGroupedByFunder)
            .map(([funderValue, relatedGrants]) => {
                const funderLabel = allFunders.find(({ value }) => value === funderValue)?.label ?? funderValue
                const funderGrants = relatedGrants.map(grant => ({
                ...grant,
                GrantAmountConverted: Number(grant.GrantAmountConverted ?? 0)
                }))
                const totalAmount = sumBy(funderGrants, 'GrantAmountConverted')
                return [funderLabel, funderGrants, totalAmount] as [string, any[], number]
            })
            .sort((a, b) => 
                orderByAmount ? b[2] - a[2] : b[1].length - a[1].length
            )
            .reduce((acc, [label, funderGrants]) => {
                acc[label] = funderGrants
                return acc
            }, {} as Record<string, any[]>)
        return {
            relatedFunders,
            activeThemeLabel
        }
    }, [activeThemeValue, allFunders, allThemes, grants, orderByAmount])
    
    const cardGridClasses = [
        'grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4',
        sidebarOpen ? 'xl:grid-cols-4 2xl:grid-cols-8' : 'lg:grid-cols-4 xl:grid-cols-8'
    ].filter(Boolean).join(' ')

    const funderGridClasses = [
        'grid gap-3 md:gap-6',
        sidebarOpen ? '2xl:grid-cols-2' : ' xl:grid-cols-2'
    ].filter(Boolean).join(' ')

    const funderControlsWrapperClasses = [
        'flex flex-col gap-y-2',
        sidebarOpen ? 'xl:gap-y-0 xl:flex-row xl:items-center xl:justify-between' : 'lg:gap-y-0 lg:flex-row lg:items-center lg:justify-between'
    ].filter(Boolean).join(' ')

    const themeLabelClasses = [
        'text-left md:text-lg lg:text-base leading-snug',
        sidebarOpen ? 'xl:text-sm' : ''
    ].filter(Boolean).join(' ')

    return (
        <VisualisationCard
            id='pandemic-epidemic-funders'
            title="Distribution of grants on pandemic and epidemic intelligence by funders"
            infoModalContents={`You're viewing funders sorted by ${orderByAmount ? 'their known financial contributions (USD)' : 'total number of grants'}. Toggle the light switch to switch the sorting metric to ${orderByAmount ? 'total number of grants' : 'known financial commitments (USD)'}.`}
            filenameToFetch='pandemic-intelligence/pandemic-intelligence-grants.csv'
            filteredFileName='pandemic-intelligence-filtered-grants.csv'
        >
            <div className="w-full space-y-8">
                <ul className={cardGridClasses}>
                    {allThemes.map(({ value, label }) => {
                        const activeAfterClasses = [
                            'after:absolute after:w-4 after:h-[36px] after:bg-gradient-to-b from-secondary to-secondary via-secondary-darker after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-2 after:border-primary after:-z-20',
                            sidebarOpen ? 'after:hidden 2xl:after:block' : 'after:hidden xl:after:block',
                        ].filter(Boolean).join(' ')

                        const listClasses = [
                            'w-full border-2 p-2 rounded-xl lg:p-3 relative z-20',
                            value === activeThemeValue ? 
                                `bg-gradient-to-b from-secondary to-secondary-darker border-2 border-primary text-primary font-bold ${activeAfterClasses}` : 
                                'bg-primary text-secondary border-primary-darker hover:bg-primary-darker transition-colors duration-300'
                        ].filter(Boolean).join(' ')
                        
                        const imageSrc = label.toLocaleLowerCase().replace('&', 'and').replaceAll(' ', '-')

                        return (
                            <li key={label} className={listClasses}>
                                <button onClick={() => setActiveThemeValue(value)} className="w-full flex flex-col justify-between h-full group space-y-2 lg:space-y-3">
                                    <h2 className={themeLabelClasses}>{label}</h2>
                            
                                    <div className="w-full overflow-hidden rounded-lg">
                                        <Image
                                            src={`/images/pandemic-intelligence-themes/${imageSrc}.svg`}
                                            alt="fallback"
                                            width={480}
                                            height={480}
                                            className='w-full aspect-square group-hover:scale-[1.1] transition-transform duration-300 ignore-in-image-export'
                                        />
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
                
                {Object.keys(relatedFunders).length > 0 && (
                    <div className="bg-gradient-to-b from-secondary to-secondary-darker border-2 border-primary text-primary rounded-2xl lg:rounded-[40px] w-full overflow-hidden">
                        <div className="p-6 lg:p-12 space-y-6 lg:space-y-8">
                            <div className="w-full relative border-b-2 border-primary flex items-start justify-between gap-x-6">
                                <h2 className="text-2xl lg:text-5xl pb-12 lg:pb-16">
                                    {activeThemeLabel}
                                </h2>
                                <p className="text-5xl lg:text-7xl bg-gradient-to-tr from-primary-darker to-primary-lighter px-3 py-1 rounded-lg text-secondary">
                                    {Object.keys(relatedFunders).length} <span className='text-xs'>Funders</span>
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className={funderControlsWrapperClasses}>
                                    <h3 className="text-2xl lg:text-3xl">
                                        Funders
                                    </h3>

                                    <DoubleLabelSwitch
                                        checked={orderByAmount}
                                        onChange={setOrderByAmount}
                                        leftLabel="Total Number of Grants"
                                        rightLabel="US Dollars Committed"
                                        screenReaderLabel="Order by number of grants"
                                        className="ignore-in-image-export"
                                        unCheckedClasses='text-primary'
                                        checkedClasses='text-gray-200'
                                    />
                                </div>
                                <ul className={funderGridClasses}>
                                    {Object.entries(relatedFunders).map(([ funderLabel, relatedGrants ], index) => {
                                        const rowNumber = Math.floor(index / 2)
                                        const isEvenRow = (rowNumber % 2) === 1 

                                        const listClasses = [
                                            'h-full p-4 rounded-lg flex flex-col gap-y-2 justify-between relative',
                                            'text-secondary',
                                            isEvenRow ? 'bg-gradient-to-br from-primary-darker to-primary-lighter' : 'bg-gradient-to-br from-primary-lighter to-primary-darker'
                                        ].filter(Boolean).join(' ')

                                        const totalFinancialCommitments = dollarValueFormatter(sumBy(relatedGrants, 'GrantAmountConverted'))

                                        // Switch the order of the first datapoint displayed based on the visualisation order by controls
                                        const listOrder = [
                                            orderByAmount ? {
                                                label: 'Known Financial Commitments (USD):',
                                                value: totalFinancialCommitments,
                                            } : {
                                                label: 'Total Grants:',
                                                value: relatedGrants.length,
                                            },
                                            orderByAmount ? { 
                                                label: 'Total Grants:', value: relatedGrants.length 
                                            } : {
                                                label: 'Known Financial Commitments (USD):',
                                                value: totalFinancialCommitments,
                                            }
                                        ]
                                        
                                        return (
                                            <li key={funderLabel} className={listClasses}>
                                                <h4 className="lg:text-lg font-bold max-w-sm">
                                                    {funderLabel} 
                                                </h4>

                                                <ul className="space-y-2">
                                                    {listOrder.map(({ label, value }) => (
                                                        <li key={label} className="w-full flex items-center justify-between gap-x-1">
                                                            <p className="whitespace-nowrap">{label}</p>
                                                            
                                                            <span className="h-[1px] w-full border border-dashed border-secondary"></span>
                                                            
                                                            <span>{value}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
        </VisualisationCard>
    )
}

export default PandemicEpidemicIntelligenceFunders