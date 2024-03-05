"use client"

import {useMemo, useState, useEffect, useRef} from "react"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import FundingAmountsForEachResearchCategoryOverTime from "../components/FundingAmountsForEachResearchCategoryOverTime"
import GrantsByDiseaseCard from "../components/GrantsByDisease/Card"
import WordCloudsCard from "../components/WordClouds/Card"
import {emptyFilters, filterGrants, GlobalFilterContext, countActiveFilters, Filters} from "../helpers/filters"
import completeDataset from '../../data/dist/grants.json'
import {throttle, debounce} from 'lodash'
import {Tooltip, TooltipRefProps} from 'react-tooltip'
import {TooltipContext} from '../helpers/tooltip'
import VisualisationCardLinks from "./components/VisualisationCardLinks"
import VisualisationJumpMenu from './components/VisualisationJumpMenu'

export default function VisualisePageClient() {
    const tooltipRef = useRef<TooltipRefProps>(null)

    const [selectedFilters, setSelectedFilters] = useState<Filters>(
        emptyFilters(),
    )

    const globallyFilteredDataset = useMemo(
        () => filterGrants(completeDataset, selectedFilters),
        [selectedFilters],
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
                />
            ),
            closedContent: (
                <dl className="flex items-center justify-center self-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                    {(globallyFilteredDataset.length < completeDataset.length) ? (
                        <>
                            <dt className="text-white uppercase">Filtered Grants Total</dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">{globallyFilteredDataset.length} / {completeDataset.length}</dd>
                        </>
                    ) : (
                        <>
                            <dt className="text-white uppercase">Total grants</dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">{globallyFilteredDataset.length}</dd>
                        </>
                    )}

                    {numberOfActiveFilters > 0 && (
                        <>
                            <dt className="text-white uppercase pt-4 mt-2 border-t-2 border-gray-500">Filters</dt>
                            <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">{numberOfActiveFilters}</dd>
                        </>
                    )}
                </dl>
            ),
        }
    }, [selectedFilters, globallyFilteredDataset])

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
        <GlobalFilterContext.Provider value={{filters: selectedFilters, grants: globallyFilteredDataset}}>
            <TooltipContext.Provider value={{tooltipRef}}>
                <Layout
                    title="Interactive Charts"
                    showSummary={true}
                    summary="Visualise our data on research grants for infectious diseases with pandemic potential using filters and searches."
                    sidebar={sidebar}
                >
                    <VisualisationJumpMenu dropdownVisible={dropdownVisible}/>

                    <VisualisationCardLinks/>

                    <div className="relative z-10 mx-auto my-6 lg:my-12 lg:container">
                        <div
                            className={`${gridClasses} mt-6`}
                        >
                            <div id='disease' className={gridClasses}>
                                <GrantsByDiseaseCard />
                            </div>

                            <div id='research-category' className={gridClasses}>
                                <GrantsByResearchCategoryCard />
                            </div>

                            <div id='geographical-distribution' className={gridClasses}>
                                <GrantsByCountryWhereResearchWasConductedCard />

                                <GrantsPerResearchCategoryByRegion />

                                <RegionalFlowOfGrantsCard />
                            </div>

                            <div id='annual-trends' className={gridClasses}>
                                <FundingAmountsForEachResearchCategoryOverTime />
                            </div>

                            <div id='word-clouds' className={gridClasses}>
                                <WordCloudsCard />
                            </div>
                        </div>

                        <Tooltip
                            ref={tooltipRef}
                            imperativeModeOnly
                            noArrow
                            place="right-start"
                            offset={10}
                            variant="light"
                            className="!px-3 !py-2 text-left border border-gray-200"
                            opacity={1}
                        />
                    </div>
                </Layout>
            </TooltipContext.Provider>
        </GlobalFilterContext.Provider>

    )
}
