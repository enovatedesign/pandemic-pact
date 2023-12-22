import {ElementType, ReactNode, useState, useContext} from "react"
import {Tab} from '@headlessui/react'
import {exportRequestBodyFilteredToMatchingGrants} from "./../helpers/meilisearch"
import {GlobalFilterContext, countActiveFilters} from "../helpers/filter"
import ExportMenu from "./ExportMenu/ExportMenu"
import InfoModal from "./InfoModal"
import { useInView, animated } from '@react-spring/web';

interface Props {
    grants: any[],
    id: string
    title: string
    subtitle?: string
    footnote?: string
    infoModalContents?: ReactNode
    children?: ReactNode
    tabs?: Array<{tab: {icon: ElementType, label: string}, content: ReactNode}>
}

export default function VisualisationCard({grants, id, title, subtitle, footnote, infoModalContents, children, tabs}: Props) {
    const {filters} = useContext(GlobalFilterContext)

    const numberOfActiveFilters = countActiveFilters(filters)

    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    );

    return <animated.div id={id} ref={ref} style={springs}>
        <div className="flex flex-col items-start space-y-6 h-full w-full bg-white p-8 rounded-2xl">
            <div className="flex flex-col items-start space-y-6">
                <div className="w-full flex justify-between items-center">
                    <div className="flex justify-start space-x-3">
                        <h2 className="text-lg capitalize">{title}</h2>

                        {infoModalContents &&
                            <InfoModal>{infoModalContents}</InfoModal>
                        }
                    </div>

                    {numberOfActiveFilters > 0 &&
                        <p className="whitespace-nowrap">{numberOfActiveFilters} Global Filters Active</p>
                    }
                </div>

                {subtitle &&
                    <p className="text-brand-grey-500">{subtitle}</p>
                }
            </div>

            {children}

            {tabs && tabs[selectedTabIndex].content}

            <div className="w-full flex flex-row-reverse justify-between items-center ignore-in-image-export">
                <ExportMenu
                    chartSelector={`#${id}`}
                    imageFilename={id}
                    dataFilename={id}
                    meilisearchRequestBody={
                        exportRequestBodyFilteredToMatchingGrants(grants)
                    }
                />

                {tabs &&
                    <Tab.Group
                        onChange={setSelectedTabIndex}
                    >
                        <Tab.List className="flex text-center space-x-1 rounded-lg bg-gray-100 p-1">
                            {tabs.map(({tab}, index) => (
                                <Tab
                                    key={`${id}-tab-${index}`}
                                    className={({selected}) => `
                                        w-full rounded-md px-2 py-1 text-sm font-medium leading-5
                                        ${selected ? 'bg-brand-teal-600 text-white shadow cursor-default' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600'}
                                    `}
                                >
                                    <div className="flex items-center">
                                        <tab.icon
                                            className="w-5 h-5"
                                        />

                                        <span
                                            className="ml-2"
                                        >
                                            {tab.label}
                                        </span>
                                    </div>
                                </Tab>
                            ))}
                        </Tab.List>
                    </Tab.Group>
                }
            </div>

            {footnote &&
                <p className="text-sm text-gray-500">{footnote}</p>
            }
        </div>
    </animated.div >
}
