"use client"

import {useMemo, useState, useEffect} from "react"
import {Text} from "@tremor/react"
import Layout from "../components/Layout"
import FilterSidebar from "../components/FilterSidebar"
import VisualisationCard from "../components/VisualisationCard"
import GrantsByResearchCategoryCard from '../components/GrantsByResearchCategory/Card'
import GrantsByCountryWhereResearchWasConductedCard from '../components/GrantsByCountryWhereResearchWasConducted/Card'
import GrantsPerResearchCategoryByRegion from '../components/GrantsPerResearchCategoryByRegion'
import RegionalFlowOfGrantsCard from '../components/RegionalFlowOfGrantsCard'
import FundingAmountsForEachResearchCategoryOverTime from "../components/FundingAmountsForEachResearchCategoryOverTime"
import GrantsByDiseaseCard from "../components/GrantsByDisease/Card"
import WordCloud from "../components/WordCloud"
import JumpMenu from "../components/JumpMenu"
import {type Filters} from "../types/filters"
import {emptyFilters, filterGrants, GlobalFilterContext, countActiveFilters} from "../helpers/filter"
import completeDataset from '../../data/dist/filterable-dataset.json'
import Card from "../components/ContentBuilder/Common/Card"
import Button from "../components/Button"
import {ChevronRightIcon} from "@heroicons/react/solid"
import {throttle, debounce} from 'lodash'
import AnimateHeight from "react-animate-height"

export default function Visualise() {
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
                <dl className="flex items-center justify-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
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
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            id: '#disease',
            image: {
                url: '/images/visualisation-card/vis-bar-chart.png',
                altText: 'Disease card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Research Categories',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            id: '#research-category',
            image: {
                url: '/images/visualisation-card/vis-category-chart.png',
                altText: 'Visualisations Card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Geographical Distribution',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            id: '#geographical-distribution',
            image: {
                url: '/images/visualisation-card/vis-radar-chart.png',
                altText: 'Graphical distribution and flow card',
                width: 480,
                height: 480,
            }
        },
        {
            title: 'Annual Trends',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            id: '#annual-trends',
            image: {
                url: '/images/visualisation-card/vis-line-chart.png',
                altText: 'Visualisations Card',
                width: 480,
                height: 480,
            }
        },
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
            <Layout
                title="Interactive Charts"
                showSummary={true}
                summary="Visualise our data on research grants for infectious diseases with pandemic potential using filters and searches."
                sidebar={sidebar}
            >
                <AnimateHeight
                    duration={300}
                    height={dropdownVisible ? 'auto' : 0}
                    className="sticky w-full z-20 top-0 bg-primary-lighter"
                >
                    <JumpMenu cardData={cardData} />
                </AnimateHeight>

                <section className="hidden lg:block container mx-auto my-6 lg:my-12">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cardData.map((card, index) =>
                        (
                            <Card
                                key={index}
                                entry={card}
                                tags={false}
                                image={card.image}
                            >
                                <Button
                                    href={card.id}
                                    size="small"
                                >
                                    <ChevronRightIcon className="text-white w-6 h-6" />
                                </Button>
                            </Card>
                        )
                        )}

                    </div>
                </section>

                <div className="container relative z-10 mx-auto my-6 lg:my-12">
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

                            <GrantsPerResearchCategoryByRegion selectedFilters={selectedFilters} />

                            <RegionalFlowOfGrantsCard />
                        </div>

                        <div id='annual-trends'>
                            <FundingAmountsForEachResearchCategoryOverTime selectedFilters={selectedFilters} />
                        </div>

                        <VisualisationCard
                            grants={globallyFilteredDataset}
                            id="disease-word-cloud"
                            title="Word cloud showing the funding for infectious diseases with a pandemic potential"
                        >
                            <div className="w-full">
                                <WordCloud
                                    filterKey="Disease"
                                    randomSeedString="2324234234"
                                />
                            </div>

                            <div>
                                <Text>
                                    The amount of funding is represented by the size of the word
                                </Text>
                            </div>
                        </VisualisationCard>

                        <VisualisationCard
                            grants={globallyFilteredDataset}
                            id="pathogen-word-cloud"
                            title="Word cloud showing the funding for priority pathogens"
                        >
                            <div className="w-full">
                                <WordCloud
                                    filterKey="Pathogen"
                                    randomSeedString="2324234234"
                                />
                            </div>

                            <div>
                                <Text>
                                    The amount of funding is represented by the size of the word
                                </Text>
                            </div>
                        </VisualisationCard>
                    </div>
                </div>
            </Layout>
        </GlobalFilterContext.Provider>
    )
}
