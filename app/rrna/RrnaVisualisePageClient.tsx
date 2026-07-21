"use client"

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, TooltipRefProps } from 'react-tooltip'
import { debounce, throttle } from 'lodash'

import { emptyRrnaFilters, filterRrnaStudies, RrnaFilterContext } from '@/app/helpers/filters'
import { AnnouncementProps } from '@/app/helpers/types'
import regionToCountryMapping from '@/data/source/region-to-country-mapping.json'
import rrnaSelectOptions from '@/data/dist/rrna/select-options.json'
import { TooltipContext } from '@/app/helpers/tooltip'

import Layout from '@/app/components/Layout'
import RrnaFilterSidebar from './RrnaFilterSidebar'
import AccordionBlock from '../components/ContentBuilder/Blocks/AccordionBlock'
import { rrnaVisualiseCardData } from './rrnaVisualiseCardData'
import VisualisationJumpMenu from '../components/VisualisationJumpMenu'
import { ChevronDownIcon } from '@heroicons/react/outline'
import Card from '../components/ContentBuilder/Common/Card'
import VisualisationCardGrid from '../components/VisualisationCardGrid'

import GeographicalDistributionOfStudySettingsCard from '@/app/components/RrnaVisualisations/GeographicalDistributionOfStudySettings/GeographicalDistributionOfStudySettingsCard'
import StudyDesignByResearchDomainCard from '@/app/components/RrnaVisualisations/StudyDesignByResearchDomain/StudyDesignByResearchDomainCard'
import StudiesByDomainAndStudyPopulationCard from '@/app/components/RrnaVisualisations/StudiesByDomainAndStudyPopulation/StudiesByDomainAndStudyPopulationCard'

interface RrnaVisualisPageClientProps {
    title: string
    summary?: string | ReactNode
    announcement: AnnouncementProps
    children?: ReactNode
    bottomAccordion?: {
        accordionHeading: string
        accordionContent: ReactNode
    }[]
}

const RrnaVisualisePageClient = ({
    title,
    summary,
    announcement,
    bottomAccordion,
    children
}: RrnaVisualisPageClientProps) => {
    // Set state for the complete dataset
    const [completeDataset, setCompleteDataset] = useState([])

    // Set loading state for loading the complete dataset
    const [loadingDataset, setLoadingDataset] = useState(true)

    const [excludeStudiesWithMultipleCountries, setExcludeStudiesWithMultipleCountries] = useState<boolean>(false)

    const [selectedRegions, setSelectedRegions] = useState<string[]>([])

    // Default to a single pathogen family (Arenaviridae) — the RRNA dashboard
    // shows one family at a time and cautions against cross-family comparison.
    const filters = useMemo(() => {
        const empty = emptyRrnaFilters()
        const arenaviridae = (rrnaSelectOptions['Pathogen Family'] as { label: string; value: string }[])
            .find(family => family.label === 'Arenaviridae')

        return {
            ...empty,
            'Pathogen Family': arenaviridae ? [arenaviridae.value] : empty['Pathogen Family'],
        }
    }, [])
    
    // Initialise the selectedFilters state
    const [selectedFilters, setSelectedFilters] = useState<any>(filters)
    
    const tooltipRef = useRef<TooltipRefProps>(null)

    // Fetch all the rrna studies on first page load and set the relevant state
    useEffect(() => {
        fetch('/data/rrna/studies.json')
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
            .catch(error => console.error(error))
    }, [])
    
    const effectiveFilters = useMemo(() => {
        if (selectedRegions.length === 0) return selectedFilters
        const expandedCodes = selectedRegions.flatMap(
            id => regionToCountryMapping[id as keyof typeof regionToCountryMapping] ?? []
        )
        const existingCountries = selectedFilters['Study Country'] as string[]
        const mergedCountries = existingCountries.length > 0
            ? expandedCodes.filter(c => existingCountries.includes(c))
            : expandedCodes
        return { ...selectedFilters, 'Study Country': mergedCountries }
    }, [selectedRegions, selectedFilters])

    const { globallyFilteredDataset } = useMemo(() => {
        let globallyFilteredDataset =  filterRrnaStudies(
            completeDataset,
            effectiveFilters,
        )

        if (excludeStudiesWithMultipleCountries) {
            globallyFilteredDataset = globallyFilteredDataset
                .filter(article => {
                    if (!article['StudyCountry']) {
                        return true
                    }

                    return article['StudyCountry'].length <= 1;
                }
            )
        }
        
        return { globallyFilteredDataset }
    }, [
        completeDataset,
        effectiveFilters,
        excludeStudiesWithMultipleCountries
    ]) 
    
    const sidebar = useMemo(() => {
        const numberOfActiveFilters = selectedFilters ? Object.keys(selectedFilters).length : 0
        
        return {
            openContent: (
                <RrnaFilterSidebar
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    completeDataset={completeDataset}
                    globallyFilteredDataset={globallyFilteredDataset}
                    loadingDataset={loadingDataset}
                    excludeStudiesWithMultipleCountries={excludeStudiesWithMultipleCountries}
                    setExcludeStudiesWithMultipleCountries={setExcludeStudiesWithMultipleCountries}
                    selectedRegions={selectedRegions}
                    setSelectedRegions={setSelectedRegions}
                />
            ),
            closedContent: (
                <dl className="flex items-center justify-center self-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                    {globallyFilteredDataset.length < completeDataset.length ? (
                        <>
                            <dt className="text-white uppercase">
                                Filtered Articles Total
                            </dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">
                                {globallyFilteredDataset.length} /{' '}
                                {completeDataset.length}
                            </dd>
                        </>
                    ) : (
                        <>
                            <dt className="text-white uppercase">
                                Total Articles
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
            excludeStudiesWithMultipleCountries,
            selectedRegions,
            setSelectedRegions,
        ]
    )

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

    const gridClasses = 'grid grid-cols-1 gap-6 lg:gap-12 scroll-mt-[50px]'

    return (
        <RrnaFilterContext.Provider
            value={{
                filters: selectedFilters,
                studies: globallyFilteredDataset,
                completeDataset,
            }}
        >
            <TooltipContext.Provider value={{ tooltipRef }}>
                <Layout
                    title={title}
                    showSummary={true}
                    summary={summary}
                    sidebar={sidebar}
                    announcement={announcement}
                >
                    <VisualisationJumpMenu
                        dropdownVisible={dropdownVisible}
                        cardData={rrnaVisualiseCardData}
                        useCardSwitch={false}
                    />

                    <VisualisationCardGrid>
                         {rrnaVisualiseCardData.map((card, index) => {
                            const entry = {
                                title: card.title,
                                summary: card.summary,
                                url: card.url,
                            }
                            
                            return (
                                <Card
                                    key={index}
                                    entry={entry}
                                    tags={false}
                                    image={card.image}
                                    animatedIcon={<ChevronDownIcon className="w-6 h-6" />}
                                />   
                            )
                        })}
                    </VisualisationCardGrid>

                    <div className="relative z-10 mx-auto lg:container">
                        {children && children}

                        <div className={`${gridClasses}`} id="visualisations-wrapper">
                            <GeographicalDistributionOfStudySettingsCard/>

                            <StudyDesignByResearchDomainCard/>

                            <StudiesByDomainAndStudyPopulationCard/>
                        </div>
                    </div>
                    
                    {bottomAccordion && bottomAccordion.length > 0 && (
                        <div className="mt-12 lg:mt-24">
                            <AccordionBlock block={{
                                accordions: bottomAccordion,
                                headingLevel: 2,
                                padded: true
                            }}/>
                        </div>
                    )}
                </Layout>
            </TooltipContext.Provider>
        </RrnaFilterContext.Provider>
    )
}

export default RrnaVisualisePageClient