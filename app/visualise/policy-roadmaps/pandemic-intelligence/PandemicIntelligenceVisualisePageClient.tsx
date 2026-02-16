'use client'

import { useMemo, useState, useEffect, useRef, Suspense, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { throttle, debounce } from 'lodash'
import { Tooltip, TooltipRefProps } from 'react-tooltip'
import Image from 'next/image'

import { 
    emptyFilters,
    filterGrants,
    GlobalFilterContext,
    countActiveFilters,
    Filters,
 } from '@/app/helpers/filters'
import { TooltipContext } from '@/app/helpers/tooltip'
import { AnnouncementProps, PolicyRoadmapEntryTypeHandle } from '@/app/helpers/types'
import { getKvDatabase } from '@/app/helpers/kv'

import Layout from '@/app/components/Layout'
import FilterSidebar from '@/app/components/FilterSidebar'
import VisualisationJumpMenu from '../../components/VisualisationJumpMenu'
import VisualisationCardLinks from '../../components/VisualisationCardLinks'
import PandemicIntelligenceThemes from './visualisations/PandemicIntelligenceThemes'
import PandemicEpidemicIntelligenceFunders from './visualisations/PandemicEpidemicIntelligenceFunders'
import AnnualTrendsByTheme from './visualisations/AnnualTendsByTheme/Card'
import TableVisualisation from '../shared-visualisations/TableVisualisation'
import GeographicalDistribution from './visualisations/GeographicalDistribution/Card'

interface VisualisationPageProps {
    title: string
    summary?: string | ReactNode
    showSummary?: boolean
    announcement: AnnouncementProps
    children?: ReactNode
    typeHandle: PolicyRoadmapEntryTypeHandle
}

const PandemicIntelligenceVisualisePageClientComponent = ({
    title,
    summary,
    showSummary = true,
    announcement,
    children,
    typeHandle
}: VisualisationPageProps) => {
    const tooltipRef = useRef<TooltipRefProps>(null)
    const [completeDataset, setCompleteDataset] = useState([])
    const [loadingDataset, setLoadingDataset] = useState(true)
    const [dropdownVisible, setDropdownVisible] = useState(false)
    
    const params = useSearchParams()
    const sharedFiltersId = params.get('share')

    useEffect(() => {
        fetch('/data/pandemic-intelligence/grants.json' )
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
            .catch(error => console.error(error))
    }, [])
    
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
    
    // Define filters using useMemo to pass in the fixedSelectOptions
    // This ensures calculations are completed before rendering 
    const filters = useMemo(() => 
        emptyFilters(undefined, typeHandle), 
        [typeHandle]
    ) 
    
    const [selectedFilters, setSelectedFilters] = useState<Filters>(filters)

    const globallyFilteredDataset = useMemo(() => 
        filterGrants(completeDataset, selectedFilters),
        [completeDataset, selectedFilters],
    )

    const BottomContent = () => (
        <Image
            src="/images/interface/policy-roadmaps-logo.jpg"
            width={350}
            height={200}
            alt="Pandemic intelligence logo"
            className="w-full rounded-xl"
        />
    )
    
    const sidebar = useMemo(() => {
        const numberOfActiveFilters = countActiveFilters(selectedFilters)
        return {
            openContent: (
                <FilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                    loadingDataset={loadingDataset}
                    sharedFiltersId={sharedFiltersId}
                    showHierarchicalFilters={true}
                    policyRoadmapEntryType={typeHandle}
                    bottomContent={<BottomContent/>}
                />
            ),
            closedContent: (
                <dl className="flex items-center justify-center self-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                    {globallyFilteredDataset.length < completeDataset.length ? (
                        <>
                            <dt className="text-white uppercase">
                                Filtered Grants Total
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {globallyFilteredDataset.length} /{' '}
                                {completeDataset.length}
                            </dd>
                        </>
                    ) : (
                        <>
                            <dt className="text-white uppercase">
                                Total grants
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {globallyFilteredDataset.length}
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
        completeDataset, 
        globallyFilteredDataset, 
        loadingDataset, 
        sharedFiltersId, 
        typeHandle
    ])

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
                completeDataset,
            }}
        >
            <TooltipContext.Provider value={{ tooltipRef }}>
                <Layout
                    title={title}
                    showSummary={showSummary}
                    summary={summary}
                    sidebar={sidebar}
                    announcement={announcement}
                    mastheadStyle='policy-roadmap'
                >
                    <VisualisationJumpMenu
                        policyRoadmapEntryType={typeHandle}
                        dropdownVisible={dropdownVisible}
                        outbreak={false}
                    />

                    <VisualisationCardLinks 
                        policyRoadmapEntryType={typeHandle}
                    />

                    {children}

                    <div
                        className="relative z-10 mx-auto my-6 lg:my-12 lg:container"
                        id="visualisations-wrapper"
                    >
                        <div className="grid grid-cols-1 gap-6 lg:gap-12">
                            <PandemicIntelligenceThemes/>

                            <TableVisualisation 
                                id="research-priority-themes-by-pathogen" 
                                title="Charts Showing Distribution Of Research Priority themes By Pathogen Families And Pathogen"
                                subtitle="Grants may fall under more than one family or pathogen or pandemic and epidemic intelligence priority theme"
                                columnHeadField="PandemicIntelligenceThemes"
                                filenameToFetch='pandemic-intelligence/pandemic-intelligence-grants.csv'
                                filteredFileName='pandemic-intelligence-filtered-grants.csv'
                            />

                            <GeographicalDistribution/>

                            <PandemicEpidemicIntelligenceFunders/>

                            <AnnualTrendsByTheme/>
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
                        />
                    </div>
                </Layout>
            </TooltipContext.Provider>
        </GlobalFilterContext.Provider>
    )
}

const PandemicIntelligenceVisualisePageClient = (props: VisualisationPageProps) => (
    <Suspense fallback={<div>Loading...</div>}>
        <PandemicIntelligenceVisualisePageClientComponent {...props} />
    </Suspense>
)

export default PandemicIntelligenceVisualisePageClient