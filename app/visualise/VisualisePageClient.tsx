'use client'

import React from 'react'
import { useMemo, useState, useEffect, useRef, useContext } from 'react'
import Layout from '../components/Layout'
import FilterSidebar from '../components/FilterSidebar'
import GrantsByMpoxResearchPriorityCard from '../components/GrantsByMpoxResearchPriority'
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import FundingAmountsForEachResearchCategoryOverTime from '../components/FundingAmountsForEachResearchCategoryOverTime'
import GrantsByDiseaseCard from '../components/GrantsByDisease/Card'
import {
    emptyFilters,
    filterGrants,
    GlobalFilterContext,
    countActiveFilters,
    Filters,
    FixedDiseaseOptionContext,
} from '../helpers/filters'
import { throttle, debounce } from 'lodash'
import { Tooltip, TooltipRefProps } from 'react-tooltip'
import { TooltipContext } from '../helpers/tooltip'
import VisualisationCardLinks from './components/VisualisationCardLinks'
import VisualisationJumpMenu from './components/VisualisationJumpMenu'
import Button from '../components/Button'
import BlockWrapper from '../components/ContentBuilder/BlockWrapper'

interface VisualisationPageProps {
    title: string
    summary?: string
    showSummary?: boolean
    outbreak?: boolean
    children?: React.ReactNode
    diseaseLabel?: string
}
export default function VisualisePageClient({
    title,
    summary,
    showSummary = true,
    outbreak = false,
    children,
    diseaseLabel,
}: VisualisationPageProps) {
    const tooltipRef = useRef<TooltipRefProps>(null)

    const [completeDataset, setCompleteDataset] = useState([])

    const [loadingDataset, setLoadingDataset] = useState(true)

    const fixedDiseaseOption = useContext(FixedDiseaseOptionContext)

    useEffect(() => {
        fetch('/data/grants.json')
            .then(response => response.json())
            .then(data => {
                setCompleteDataset(data)
                setLoadingDataset(false)
            })
    }, [])

    const [selectedFilters, setSelectedFilters] = useState<Filters>(
        emptyFilters(fixedDiseaseOption?.value),
    )

    const globallyFilteredDataset = useMemo(
        () => filterGrants(completeDataset, selectedFilters),
        [completeDataset, selectedFilters],
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
                >
                    <VisualisationJumpMenu dropdownVisible={dropdownVisible} outbreak={outbreak}/>

                    <VisualisationCardLinks
                        outbreak={outbreak}
                        disease={diseaseLabel}
                    />

                    {children}

                    {(outbreak && diseaseLabel && diseaseLabel.toLocaleLowerCase() === 'pandemic-prone influenza') && (
                        <div className='container pb-8 lg:pb-12 flex flex-col md:flex-row md:justify-center gap-6'>
                            <Button 
                                onClick={() => setSelectedFilters(
                                    emptyFilters(fixedDiseaseOption?.value, false, false)
                                )}
                                customClasses='!normal-case'
                            >
                                {`All ${diseaseLabel} grants`}
                            </Button>

                            <Button 
                                onClick={() => setSelectedFilters(
                                    emptyFilters(fixedDiseaseOption?.value, true, false)
                                )}
                                customClasses='!normal-case'
                            >
                                Only H5 grants
                            </Button>

                            <Button 
                                onClick={() => setSelectedFilters(
                                    emptyFilters(fixedDiseaseOption?.value)
                                )}
                                customClasses='!normal-case'
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

                            {outbreak ? (
                                <div
                                    id="mpox-research-priorities"
                                    className={gridClasses}
                                >
                                    <GrantsByMpoxResearchPriorityCard />
                                </div>
                            ) : (
                                <div
                                    id="research-category"
                                    className={gridClasses}
                                >
                                    <GrantsByResearchCategoryCard />
                                </div>
                            )}

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
                        />
                    </div>
                </Layout>
            </TooltipContext.Provider>
        </GlobalFilterContext.Provider>
    )
}
