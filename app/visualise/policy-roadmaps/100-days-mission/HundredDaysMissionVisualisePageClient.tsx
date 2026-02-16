'use client'

import { useMemo, useState, useEffect, useRef, Suspense, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { throttle, debounce } from 'lodash'
import { Tooltip, TooltipRefProps } from 'react-tooltip'

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
import ClinicalResearchGrants from './visualisations/ClinicalResearchGrants'
import StudyPopulations from './visualisations/StudyPopulations/StudyPopulations'
import GeographicalDistribution from './visualisations/GeographicalDistribution/GeographicalDistribution'
import ImplementationAndAccess from './visualisations/ImplementationAndAccess/ImplementationAndAccess'
import ClinicalTrials from './visualisations/ClinicalTrials/ClinicalTrials'
import CustomFilters from './CustomFilters'
import TableVisualisation from '../shared-visualisations/TableVisualisation'
import Image from 'next/image'

interface VisualisationPageProps {
    title: string
    summary?: string | ReactNode
    showSummary?: boolean
    announcement: AnnouncementProps
    children?: ReactNode
    typeHandle: PolicyRoadmapEntryTypeHandle
}

const HundredDaysMissionVisualisePageClientComponent = ({
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

    useEffect(() => {
        fetch('/data/100-days-mission/grants.json' )
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
            .catch(error => console.error(error))
    }, [])

    const params = useSearchParams()
    const sharedFiltersId = params.get('share')
    
    // Define filters using useMemo to pass in the fixedSelectOptions
    // This ensures calculations are completed before rendering 
    const filters = useMemo(() => 
        emptyFilters(undefined, typeHandle), 
        [typeHandle]
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
        filterGrants(completeDataset, selectedFilters),
        [completeDataset, selectedFilters],
    )

    const BottomContent = () => (
        <Image
            src="/images/interface/hundred-days-mission-logo.jpg"
            width={350}
            height={230}
            alt="Hundred days mission logo"
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
                    showHierarchicalFilters={false}
                    policyRoadmapEntryType={typeHandle}
                    customFilters={<CustomFilters 
                            selectedFilters={selectedFilters} 
                            setSelectedFilters={setSelectedFilters}
                        />
                    }
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
                                {globallyFilteredDataset.length.toLocaleString()} /{' '}
                                {completeDataset.length.toLocaleString()}
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
        completeDataset, 
        globallyFilteredDataset, 
        loadingDataset, 
        sharedFiltersId, 
        typeHandle
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
                        <div className={`${gridClasses} mt-6`}>
                            <ClinicalResearchGrants/>

                            <TableVisualisation
                                id="distribution-of-clinical-research-grants-by-pathogen-families-and-pathogen"
                                title="Distribution of research grants by pathogen families and pathogen"
                                subtitle="Grants may fall under more than one family or pathogen"
                                columnHeadField="HundredDaysMissionResearchArea"
                                filenameToFetch='100-days-mission/100-days-mission-grants.csv'
                                filteredFileName='100-days-mission-filtered-grants.csv'
                            />
                        
                            <ClinicalTrials/>
                        
                            <StudyPopulations />
                        
                            <GeographicalDistribution />

                            <ImplementationAndAccess />
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

const HundredDaysMissionVisualisePageClient = (props: VisualisationPageProps) => (
    <Suspense fallback={<div>Loading...</div>}>
        <HundredDaysMissionVisualisePageClientComponent {...props} />
    </Suspense>
)

export default HundredDaysMissionVisualisePageClient