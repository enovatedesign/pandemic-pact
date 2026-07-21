"use client"

import { useMemo, useState } from "react"

import { XIcon } from "@heroicons/react/outline"
import { ChevronDownIcon } from '@heroicons/react/solid'
import { formatDistributionOfStudySettingsStatusBarContent } from "./helpers"
import { rrnaMapControlState } from "@/app/helpers/types"
import selectOptions from '@/data/dist/rrna/select-options.json'

interface StatusBarProps {
    articles: any[]
    selectedFeatureProperties: any
    setSelectedFeatureId: (state: string | null) => void
    mapControlState: rrnaMapControlState
}

const StatusBar = ({ articles, selectedFeatureProperties, setSelectedFeatureId, mapControlState }: StatusBarProps) => {
    const [activeDisease, setActiveDisease] = useState<string>('')
    
    const { name, totalRelatedArticles, relatedDiseasesToSelectedLocation } = useMemo(() => (
        formatDistributionOfStudySettingsStatusBarContent(articles, selectedFeatureProperties, mapControlState.locationType)
    ), [articles, selectedFeatureProperties, mapControlState.locationType])
    
    const wrapperClasses = [
        'w-full py-2 rounded-lg text-sm shadow-lg',
        'border border-brand-grey-200',
        'lg:max-w-3xl'
    ].join(' ')
    
    return (
        <div className="w-full flex justify-center">
            <div className={wrapperClasses}>
                <div className="pb-2 border-b border-brand-grey-200 px-4 flex justify-between items-center">
                    <p className="font-medium text-brand-grey-700">
                        {name} &#45; <span>
                            Total: {totalRelatedArticles}
                        </span>
                    </p>

                    <button
                        onClick={() => {
                            setSelectedFeatureId(null)
                            setActiveDisease('')
                        }}
                        aria-label='Close map content'
                    >
                        <XIcon className="text-brand-grey-700 size-4 hover:scale-[1.2] transition duration-150" aria-hidden="true"/>
                    </button>
                </div>

                <ul className="p-4">    
                    {relatedDiseasesToSelectedLocation.map(({disease, totalNumberOfStudiesRelatedToDisease, diseaseSpecificResearchDomains}) => {
                        const filteredResearchDomains = diseaseSpecificResearchDomains
                            .filter(({researchDomain}) => 
                                mapControlState.filteredResearchDomains.includes(researchDomain)
                        )

                        const researchDomainsArePresent = filteredResearchDomains.some(researchDomain => researchDomain.count > 0)

                        // Find the label for the disease code from selectOptions
                        const diseaseLabel = (selectOptions['Disease']?.find(option => option.value === disease)?.label) || disease

                        return (
                            <li key={disease}>
                                <div className="space-y-2 flex items-center justify-between space-x-8">
                                    <p className="text-left text-brand-grey-700 whitespace-nowrap">
                                        {diseaseLabel}
                                    </p>

                                    <div className='hidden sm:block h-[1px] w-full border-b border-dashed border-brand-grey-300'></div>

                                    <p className="font-medium tabular-nums sm:whitespace-nowrap text-brand-grey-700 flex items-center gap-x-1">
                                        {totalNumberOfStudiesRelatedToDisease}

                                        {researchDomainsArePresent && (
                                            <button onClick={() => {
                                                activeDisease === disease ? setActiveDisease('') : setActiveDisease(disease)
                                            }}>
                                                <ChevronDownIcon className={`${activeDisease === disease && 'rotate-180'} w-6 h-6transition duration-300`}/>
                                            </button>
                                        )}
                                    </p>
                                </div>
                                {researchDomainsArePresent && (activeDisease === disease) && (
                                    <ul className="pl-4 pr-7">
                                        {filteredResearchDomains.map(({researchDomain, count}) => (
                                            <li key={researchDomain} className="space-y-2 flex items-center justify-between space-x-8">
                                                <p className="text-left text-brand-grey-700 whitespace-nowrap">
                                                    {researchDomain}
                                                </p>

                                                <div className='hidden sm:block h-[1px] w-full border-b border-dashed border-brand-grey-300'></div>

                                                <p className="font-medium tabular-nums sm:whitespace-nowrap text-brand-grey-700">
                                                    {count}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export default StatusBar