'use client'

import { useMemo, useState, useEffect, useRef, Suspense, useContext, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { throttle, debounce } from 'lodash'
import { Tooltip, TooltipRefProps } from 'react-tooltip'

import Layout from '../components/Layout'
import FilterSidebar from '../components/FilterSidebar'
import GrantsByMpoxResearchPriorityCard from '../components/GrantsByMpoxResearchPriority'
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import FundingAmountsForEachResearchCategoryOverTime from '../components/FundingAmountsForEachResearchCategoryOverTime/FundingAmountsForEachResearchCategoryOverTime'
import GrantsByDiseaseCard from '../components/GrantsByDisease/Card'
import {
    emptyFilters,
    filterGrants,
    GlobalFilterContext,
    countActiveFilters,
    Filters,
    FixedSelectOptionContext,
} from '../helpers/filters'
import { TooltipContext } from '../helpers/tooltip'
import { AnnouncementProps, DiseaseLabel, FixedSelectOptions } from '../helpers/types'
import { getKvDatabase } from '../helpers/kv'

import VisualisationCardLinks from './components/VisualisationCardLinks'
import VisualisationJumpMenu from './components/VisualisationJumpMenu'
import Button from '../components/Button'
import InfoModal from '../components/InfoModal'
import ClinicalTrialsTherapeuticsAndVaccines from '../components/ClinicalTrialsTherapeuticsAndVaccines/Card'
import MarburgResearchAndPolicyRoadmaps from '../components/MarburgResearchAndPolicyRoadmaps'
import GrantsByWHOMpoxRoadmap from '../components/GrantsByWHOMpoxRoadmap'

interface VisualisationPageProps {
    title: string
    summary?: string | ReactNode
    showSummary?: boolean
    outbreak?: boolean
    children?: ReactNode
    diseaseLabel?: DiseaseLabel
    announcement: AnnouncementProps
}

const VisualisePageClientComponent = ({
    title,
    summary,
    showSummary = true,
    outbreak = false,
    children,
    diseaseLabel,
    announcement,
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
        filterGrants(completeDataset, selectedFilters, outbreakSelectOptions),
        [completeDataset, selectedFilters, outbreakSelectOptions],
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
                    outbreak={outbreak}
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

    // Hide the radar and sankey visualisations if we are on the
    // "Pandemic-prone influenza" outbreak page
    const shouldShowRadarAndSankey = outbreakSelectOptions && outbreakSelectOptions['Diseases'].value !== '6142004'
    
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

                    {outbreak &&
                        diseaseLabel &&
                        diseaseLabel.toLowerCase() ===
                            'pandemic-prone influenza' && (
                            <div className="container pb-8 lg:pb-12 flex flex-col md:flex-row md:justify-center gap-6 lg:gap-8 xl:gap-12">
                                <div className="relative">
                                    <Button
                                        onClick={() =>
                                            setSelectedFilters(
                                                emptyFilters(outbreakSelectOptions)
                                            )
                                        }
                                        customClasses="max-md:w-full !normal-case"
                                    >
                                        <span className="pr-5">
                                            {`All ${diseaseLabel} grants`}
                                        </span>
                                    </Button>

                                    <InfoModal
                                        customButtonClasses="absolute right-3 top-1/2 -translate-y-1/2 z-"
                                        iconSize="size-8"
                                    >
                                        <p>
                                            Pandemic-prone influenza includes
                                            any influenza strain that has been
                                            known to result in pandemics,
                                            outbreaks, or extensive spread among
                                            or between species, i.e. H1N1, H2N2,
                                            H3N2, H5N1, H5N6, H7N9, or strains
                                            that may pose potential pandemic
                                            risk, or deemed as priority
                                            pathogens i.e. highly pathogenic
                                            avian influenza, influenza A H
                                            antigens - H1, H2, H3, H5, H6, H7,
                                            H10. Research projects that include
                                            terms such as ‘influenza A’,
                                            ‘pandemic influenza’, ‘emerging
                                            influenza viruses’, ‘universal
                                            influenza vaccine’, or ‘influenza’
                                            and ‘pandemic potential’, were
                                            considered under pandemic-prone
                                            influenza.
                                        </p>
                                    </InfoModal>
                                </div>

                                <Button
                                    onClick={() =>
                                        setSelectedFilters(
                                            emptyFilters(outbreakSelectOptions),
                                        )
                                    }
                                    customClasses="!normal-case"
                                >
                                    Only H5 grants
                                </Button>

                                <Button
                                    onClick={() =>
                                        setSelectedFilters(
                                            emptyFilters(outbreakSelectOptions)
                                        )
                                    }
                                    customClasses="!normal-case"
                                >
                                    Only H5N1 grants
                                </Button>
                            </div>
                        )}

                    <div
                        className="relative z-10 mx-auto my-6 lg:my-12 lg:container"
                        id="visualisations-wrapper"
                    >
                        <div className={`${gridClasses} mt-6`}>
                            <div id="disease" className={gridClasses}>
                                <GrantsByDiseaseCard outbreak={outbreak} />
                            </div>

                            {diseaseLabel ? (
                                diseaseLabel === 'Mpox' ? (
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

                                {shouldShowRadarAndSankey && (
                                    <>
                                        <GrantsPerResearchCategoryByRegion />

                                        <RegionalFlowOfGrantsCard />
                                    </>
                                )}
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
