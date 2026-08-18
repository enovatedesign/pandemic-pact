'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import Layout from '../../components/Layout'
import {
    GlobalFilterContext,
    Filters,
    filterRecords,
    emptyClinicalTrialsFilters,
    countActiveFilters,
} from '../../helpers/filters'
import { AnnouncementProps } from '../../helpers/types'

import ClinicalTrialsFilterSidebar from './ClinicalTrialsFilterSidebar'
import JumpCards from '../../visualise/components/JumpCards'
import ScrollJumpBar from '../../visualise/components/ScrollJumpBar'
import { clinicalTrialsJumpCards } from './jumpCards'
import GeographicDistribution from './visualisations/GeographicDistribution'
import AnnualRegistrationsByDisease from './visualisations/AnnualRegistrationsByDisease'
import PhaseDevelopmentStage from './visualisations/PhaseDevelopmentStage'
import InterventionByPathogenFamily from './visualisations/InterventionByPathogenFamily'

interface Props {
    title: string
    summary?: string
    announcement: AnnouncementProps
}

function VisualisePageClientComponent({ title, summary, announcement }: Props) {
    const [completeDataset, setCompleteDataset] = useState<any[]>([])
    const [loadingDataset, setLoadingDataset] = useState(true)

    const [selectedFilters, setSelectedFilters] = useState<Filters>(
        emptyClinicalTrialsFilters(),
    )
    const [excludeLinkedTrials, setExcludeLinkedTrials] = useState(false)

    useEffect(() => {
        fetch('/data/clinical-trials/trials.json')
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
            .catch(error => console.error(error))
    }, [])

    const globallyFilteredDataset = useMemo(() => {
        let filtered = filterRecords(completeDataset, selectedFilters)

        if (excludeLinkedTrials) {
            filtered = filtered.filter((trial: any) => !trial.LinkedTrial)
        }

        return filtered
    }, [completeDataset, selectedFilters, excludeLinkedTrials])

    const sidebar = useMemo(
        () => ({
            openContent: (
                <ClinicalTrialsFilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                    loadingDataset={loadingDataset}
                    excludeLinkedTrials={excludeLinkedTrials}
                    setExcludeLinkedTrials={setExcludeLinkedTrials}
                />
            ),
            closedContent: (
                <dl className="flex items-center justify-center self-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                    <dt className="text-white uppercase">
                        {globallyFilteredDataset.length < completeDataset.length
                            ? 'Filtered registrations'
                            : 'Total registrations'}
                    </dt>
                    <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                        {globallyFilteredDataset.length.toLocaleString()}
                        {globallyFilteredDataset.length < completeDataset.length &&
                            ` / ${completeDataset.length.toLocaleString()}`}
                    </dd>
                    {countActiveFilters(selectedFilters) > 0 && (
                        <>
                            <dt className="text-white uppercase pt-4 mt-2 border-t-2 border-gray-500">
                                Filters
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {countActiveFilters(selectedFilters)}
                            </dd>
                        </>
                    )}
                </dl>
            ),
        }),
        [
            selectedFilters,
            completeDataset,
            globallyFilteredDataset,
            loadingDataset,
            excludeLinkedTrials,
        ],
    )

    const gridClasses = 'grid grid-cols-1 gap-6 lg:gap-12'

    return (
        <GlobalFilterContext.Provider
            value={{
                filters: selectedFilters,
                grants: globallyFilteredDataset,
                completeDataset,
            }}
        >
            <Layout
                title={title}
                summary={summary}
                sidebar={sidebar}
                announcement={announcement}
            >
                <ScrollJumpBar items={clinicalTrialsJumpCards} />

                <JumpCards
                    items={clinicalTrialsJumpCards}
                    gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                />

                <div
                    className="relative z-10 mx-auto my-6 lg:my-12 lg:container"
                    id="visualisations-wrapper"
                >
                    <div className={`${gridClasses} mt-6`}>
                        <GeographicDistribution />
                        <AnnualRegistrationsByDisease />
                        <PhaseDevelopmentStage />
                        <InterventionByPathogenFamily />
                    </div>
                </div>
            </Layout>
        </GlobalFilterContext.Provider>
    )
}

export default function VisualisePageClient(props: Props) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VisualisePageClientComponent {...props} />
        </Suspense>
    )
}
