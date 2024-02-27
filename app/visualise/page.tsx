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
import JumpMenu from "../components/JumpMenu"
import {emptyFilters, filterGrants, GlobalFilterContext, countActiveFilters, Filters} from "../helpers/filters"
import completeDataset from '../../data/dist/grants.json'
import Card from "../components/ContentBuilder/Common/Card"
import {throttle, debounce} from 'lodash'
import AnimateHeight from "react-animate-height"
import {Tooltip, TooltipRefProps} from 'react-tooltip'
import {TooltipContext} from '../helpers/tooltip'
import {ChevronDownIcon} from "@heroicons/react/solid"

export default function Visualise() {
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

    const cardData = [
        {
            title: 'Disease',
            summary: 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, Mpox and Plague.',
            url: '#disease',
            image: {
                url: '/images/visualisation-card/vis-bar-chart.png',
                altText: 'Disease card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Research Categories',
            summary: 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.',
            url: '#research-category',
            image: {
                url: '/images/visualisation-card/vis-category-chart.png',
                altText: 'Visualisations Card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Geographical Distribution',
            summary: 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.',
            url: '#geographical-distribution',
            image: {
                url: '/images/visualisation-card/vis-radar-chart.png',
                altText: 'Graphical distribution and flow card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Annual Trends',
            summary: 'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.',
            url: '#annual-trends',
            image: {
                url: '/images/visualisation-card/vis-line-chart.png',
                altText: 'Visualisations Card',
                width: 300,
                height: 300,
            }
        },
        {
            title: 'Policy Roadmap Card',
            summary: 'In progress: Alignment of research grant data to research agendas and policy roadmaps eg. 100 Days Mission.',
            url: '#',
            image: {
                url: '',
                altText: 'Policy Roadmap Card ',
                width: 300,
                height: 300,
            }
        },
        // {
        //     title: 'Word Clouds',
        //     summary: 'Review and download our Word Clouds for your presentations to show the total number of grants and amounts committed to research on specific diseases.',
        //     url: '#word-clouds',
        //     image: {
        //         url: '/images/visualisation-card/vis-word-cloud.png',
        //         altText: 'Visualisations Card',
        //         width: 480,
        //         height: 480,
        //     }
        // },
    ]

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
                    summary="Visualise expansive data on research grants for infectious disease with a pandemic potential using advanced filters and search functions."
                    sidebar={sidebar}
                >
                    <AnimateHeight
                        duration={300}
                        height={dropdownVisible ? 'auto' : 0}
                        className="sticky w-full z-20 top-0 bg-primary-lighter/75 backdrop-blur-sm"
                    >
                        <JumpMenu cardData={cardData} />
                    </AnimateHeight>

                    <section className="hidden lg:block container mx-auto my-6 lg:my-12">
                        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                            {cardData.map((card, index) => {

                                return (
                                    <Card
                                        key={index}
                                        entry={card}
                                        tags={false}
                                        image={card.image}
                                        animatedIcon={<ChevronDownIcon className="w-6 h-6" />}
                                    />
                                )
                            })}
                        </div>
                    </section>

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
