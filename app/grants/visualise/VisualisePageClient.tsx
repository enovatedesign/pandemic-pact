'use client'

import { useMemo, useState, useEffect, useRef, Suspense, useContext, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { throttle, debounce } from 'lodash'
import { Tooltip, TooltipRefProps } from 'react-tooltip'

import Layout from '../../components/Layout'
import FilterSidebar from '../../components/FilterSidebar'
import GrantsByMpoxResearchPriorityCard from '../../components/GrantsByMpoxResearchPriority'
import GrantsByResearchCategoryCard from '../../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../../components/RegionalFlowOfGrantsCard'
import FundingAmountsForEachResearchCategoryOverTime from '../../components/FundingAmountsForEachResearchCategoryOverTime/FundingAmountsForEachResearchCategoryOverTime'
import GrantsByDiseaseCard from '../../components/GrantsByDisease/Card'
import {
    emptyFilters,
    filterGrants,
    GlobalFilterContext,
    countActiveFilters,
    Filters,
    FixedSelectOptionContext,
} from '../../helpers/filters'
import { TooltipContext, sharedTooltipStyle } from '../../helpers/tooltip'
import { AnnouncementProps, DiseaseLabel } from '../../helpers/types'
import { getKvDatabase } from '../../helpers/kv'

import VisualisationCardLinks from '@/app/visualise/components/VisualisationCardLinks'
import VisualisationJumpMenu from '@/app/visualise/components/VisualisationJumpMenu'
import ClinicalTrialsTherapeuticsAndVaccines from '../../components/ClinicalTrialsTherapeuticsAndVaccines/Card'
import MarburgResearchAndPolicyRoadmaps from '../../components/MarburgResearchAndPolicyRoadmaps'
import GrantsByWHOMpoxRoadmap from '../../components/GrantsByWHOMpoxRoadmap'
import EbolaCorcPrioritiesCard from '../../components/EbolaCorcPrioritiesCard'

interface VisualisationPageProps {
    title: string
    summary?: string
    showSummary?: boolean
    outbreak?: boolean
    children?: ReactNode
    diseaseLabel?: DiseaseLabel
    outbreakId?: string
    announcement: AnnouncementProps
    slug?: string
}

const VisualisePageClientComponent = ({
    title,
    summary,
    showSummary = true,
    outbreak = false,
    children,
    diseaseLabel,
    outbreakId,
    announcement,
    slug
}: VisualisationPageProps) => {
    const tooltipRef = useRef<TooltipRefProps>(null)

    const [completeDataset, setCompleteDataset] = useState([])

    const [loadingDataset, setLoadingDataset] = useState(true)

    const { outbreakSelectOptions } = useContext(FixedSelectOptionContext)

    useEffect(() => {
        fetch('/data/grants.json')
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
            .catch(error => console.error(error))
    }, [])

    // Apply any page-level constraints before user filters.
    // On outbreak pages with an outbreakId, only include grants tagged
    // with that outbreak. On all other pages, this is a no-op.
    const pageDataset = useMemo(() => {
        if (!outbreakId || completeDataset.length === 0) return completeDataset
        return completeDataset.filter((grant: any) =>
            grant.OutbreakIds?.includes(outbreakId)
        )
    }, [completeDataset, outbreakId])

    const params = useSearchParams()
    const sharedFiltersId = params.get('share')

    // Define filters using useMemo to pass in the fixedSelectOptions
    // This ensures calculations are completed before rendering 
    const filters = useMemo(() => 
        emptyFilters(outbreakSelectOptions), 
        [outbreakSelectOptions]
    ) 
    
    const [selectedFilters, setSelectedFilters] = useState<Filters>(filters)
    
    useEffect(() => {
        const getSharedFilters = async () => {
            if (sharedFiltersId) {
                const sharedFilterSet = await getKvDatabase(sharedFiltersId)
                
                if (sharedFilterSet) {
                    setSelectedFilters(sharedFilterSet)
                }
            }
        }

        getSharedFilters()
    }, [sharedFiltersId])

    const globallyFilteredDataset = useMemo(() =>
        filterGrants(pageDataset, selectedFilters, outbreakSelectOptions),
        [pageDataset, selectedFilters, outbreakSelectOptions],
    )
    
    const sidebar = useMemo(() => {
        const numberOfActiveFilters = countActiveFilters(selectedFilters)
        return {
            openContent: (
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={pageDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                    loadingDataset={loadingDataset}
                    sharedFiltersId={sharedFiltersId}
                    outbreak={outbreak}
                />
            ),
            closedContent: (
                <dl className="flex items-center justify-center self-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                    {globallyFilteredDataset.length < pageDataset.length ? (
                        <>
                            <dt className="text-white uppercase">
                                Filtered Grants Total
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {globallyFilteredDataset.length.toLocaleString()} /{' '}
                                {pageDataset.length.toLocaleString()}
                            </dd>
                        </>
                    ) : (
                        <>
                            <dt className="text-white uppercase">
                                Total grants
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {globallyFilteredDataset.length.toLocaleString()}
                            </dd>
                        </>
                    )}

                    {numberOfActiveFilters > 0 && (
                        <>
                            <dt className="text-white uppercase pt-4 mt-2 border-t-2 border-gray-500">
                                Filters
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {numberOfActiveFilters}
                            </dd>
                        </>
                    )}
                </dl>
            ),
        }
    }, [
        selectedFilters,
        pageDataset,
        globallyFilteredDataset,
        loadingDataset,
        sharedFiltersId,
        outbreak
    ])

    const gridClasses = 'grid grid-cols-1 gap-6 lg:gap-12 scroll-mt-[50px]'

    const [dropdownVisible, setDropdownVisible] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setDropdownVisible(true)
            } else {
                setDropdownVisible(false)
            }
        }

        const debouncedHandleResize = debounce(handleResize, 200)
        window.addEventListener('resize', debouncedHandleResize)

        const handleDropdown = () => {
            if (window.innerWidth > 1024) {
                if (window.scrollY > 1000) {
                    setDropdownVisible(true)
                } else {
                    setDropdownVisible(false)
                }
            }
        }
        const throttledHandleDropdown = throttle(handleDropdown, 200)
        window.addEventListener('scroll', throttledHandleDropdown)

        return () => {
            window.removeEventListener('scroll', throttledHandleDropdown)
            window.removeEventListener('resize', debouncedHandleResize)
        }
    }, [dropdownVisible])

    return (
        <GlobalFilterContext.Provider
            value={{
                filters: selectedFilters,
                grants: globallyFilteredDataset,
                completeDataset: pageDataset,
            }}
        >
            <TooltipContext.Provider value={{ tooltipRef }}>
                <Layout
                    title={title}
                    showSummary={showSummary}
                    summary={summary}
                    sidebar={sidebar}
                    outbreak={outbreak}
                    announcement={announcement}
                >
                    <VisualisationJumpMenu
                        dropdownVisible={dropdownVisible}
                        outbreak={outbreak}
                        disease={diseaseLabel}
                    />

                    <VisualisationCardLinks
                        outbreak={outbreak}
                        disease={diseaseLabel}
                    />

                    {children}

                    <div
                        className="relative z-10 mx-auto my-6 lg:my-12 lg:container"
                        id="visualisations-wrapper"
                    >
                        <div className={`${gridClasses} mt-6`}>
                            <div id="disease" className={gridClasses}>
                                <GrantsByDiseaseCard outbreak={outbreak} />
                            </div>

                            {diseaseLabel ? (
                                diseaseLabel === 'mpox' ? (
                                    <>
                                        <div
                                            id="grants-by-who-mpox-roadmap"
                                            className={gridClasses}
                                        >
                                            <GrantsByWHOMpoxRoadmap />
                                        </div>
                                        <div
                                            id="research-categories-policy-roadmaps"
                                            className={gridClasses}
                                        >
                                            <GrantsByMpoxResearchPriorityCard />
                                        </div>
                                    </>
                                ) : diseaseLabel === 'Marburg virus disease' ? (
                                    <>
                                        <div id="marburg-research-policy-and-roadmaps" className={gridClasses}>
                                            <MarburgResearchAndPolicyRoadmaps />
                                        </div>
                                        
                                        <div
                                            id="research-categories"
                                            className={gridClasses}
                                        >
                                            <GrantsByResearchCategoryCard />
                                        </div>
                                    </>
                                ) : slug && slug === 'ebola-2' ? (
                                    <div id="ebola-corc-priorities">
                                        <EbolaCorcPrioritiesCard/>
                                    </div>
                                ) : (
                                    <div
                                        id="research-categories"
                                        className={gridClasses}
                                    >
                                        <GrantsByResearchCategoryCard />
                                    </div>
                                )
                            ) : (
                                <div
                                    id="research-categories"
                                    className={gridClasses}
                                >
                                    <GrantsByResearchCategoryCard />
                                </div>
                            )}
                            
                            <div id="clinical-trials">
                                <ClinicalTrialsTherapeuticsAndVaccines/>
                            </div>
                            
                            <div
                                id="geographical-distribution"
                                className={gridClasses}
                            >
                                <GrantsByCountryWhereResearchWasConductedCard />

                                <GrantsPerResearchCategoryByRegion />

                                <RegionalFlowOfGrantsCard />
                            </div>

                            <div id="annual-trends" className={gridClasses}>
                                <FundingAmountsForEachResearchCategoryOverTime />
                            </div>
                        </div>

                        <Tooltip
                            ref={tooltipRef}
                            imperativeModeOnly
                            noArrow
                            place="right-start"
                            offset={10}
                            variant="light"
                            opacity={1}
                            disableStyleInjection
                            style={sharedTooltipStyle}
                        />
                    </div>
                </Layout>
            </TooltipContext.Provider>
        </GlobalFilterContext.Provider>
    )
}

const VisualisePageClient = (props: VisualisationPageProps) => (
    <Suspense fallback={<div>Loading...</div>}>
        <VisualisePageClientComponent {...props} />
    </Suspense>
)

export default VisualisePageClient
