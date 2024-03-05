import { ElementType, ReactNode, useState, useContext } from 'react'
import { Tab } from '@headlessui/react'
import {
    GlobalFilterContext,
    countActiveFilters,
    availableFilters,
} from '../helpers/filters'
import ExportMenu from './ExportMenu/ExportMenu'
import InfoModal from './InfoModal'
import { useInView, animated } from '@react-spring/web'
import { FilterIcon } from '@heroicons/react/solid'
import { Tooltip } from 'react-tooltip'

interface Props {
    id: string
    title: string
    subtitle?: string
    footnote?: string
    infoModalContents?: ReactNode
    children?: ReactNode
    tabs?: Array<{
        tab: { icon: ElementType; label: string }
        content: ReactNode
    }>
    tabPrefixLabel?: string
}

export default function VisualisationCard({
    id,
    title,
    subtitle,
    footnote,
    infoModalContents,
    children,
    tabs,
    tabPrefixLabel,
}: Props) {
    const { filters } = useContext(GlobalFilterContext)

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
    )

    const toolTipFilters = Object.entries(filters)
        .filter(([_, filter]) => filter.values.length > 0)
        .map(([key]) => key)

    const appliedFilterLabels = availableFilters()
        .filter(filter => toolTipFilters.includes(filter.field))
        .map(filter => filter.label)

    return (
        <>
            <animated.div id={id} ref={ref} style={springs}>
                <div className="flex flex-col items-start gap-y-6 h-full w-full bg-white p-8 lg:p-10 border-y-2 border-gray-200 lg:rounded-xl lg:border-2 relative overflow-hidden">
                    <div className="flex flex-col items-start gap-y-6">
                        <div className="mr-16">
                            <h2 className="text-lg capitalize inline">
                                {title}
                            </h2>{' '}
                            {infoModalContents && (
                                <InfoModal customButtonClasses="align-middle -translate-y-[2px]">
                                    {infoModalContents}
                                </InfoModal>
                            )}
                        </div>

                        {numberOfActiveFilters > 0 && (
                            <div>
                                <div className="absolute -right-16 -top-16 aspect-square size-32 rotate-45 bg-gradient-to-b from-primary"></div>
                                <div className="absolute right-5 top-5">
                                    <FilterIcon
                                        className="size-10 text-secondary"
                                        data-tooltip-id={`${id}-tooltip`}
                                    />
                                </div>
                                <div className="absolute right-3 top-3 size-6 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                                    {numberOfActiveFilters}{' '}
                                    <span className="sr-only">
                                        Global Filters Applied
                                    </span>
                                </div>
                                {appliedFilterLabels && (
                                    <Tooltip
                                        id={`${id}-tooltip`}
                                        className="z-10"
                                        key="left"
                                    >
                                        <p>Currently Active Filters:</p>
                                        <ul>
                                            {appliedFilterLabels.map(
                                                (filter, index: number) => {
                                                    return (
                                                        <li key={index}>
                                                            {`Filter by ${filter}`}
                                                        </li>
                                                    )
                                                }
                                            )}
                                        </ul>
                                    </Tooltip>
                                )}
                            </div>
                        )}

                        {subtitle && (
                            <p className="text-brand-grey-500">{subtitle}</p>
                        )}
                    </div>

                    {children}

                    {tabs && tabs[selectedTabIndex].content}

                    <div className="w-full flex flex-col-reverse gap-y-4 justify-between items-center ignore-in-image-export md:flex-row-reverse md:gap-y-0">
                        <ExportMenu
                            chartSelector={`#${id}`}
                            imageFilename={id}
                        />

                        {tabs && (
                            <div className="flex flex-col items-center md:flex-row gap-2">
                                {tabPrefixLabel && <p>{tabPrefixLabel}</p>}

                                <Tab.Group onChange={setSelectedTabIndex}>
                                    <Tab.List className="flex text-center gap-x-1 rounded-lg bg-gray-100 p-1">
                                        {tabs.map(({ tab }, index) => (
                                            <Tab
                                                key={`${id}-tab-${index}`}
                                                className={({ selected }) => `
                                                    w-full rounded-md px-2 py-1 text-sm font-medium leading-5
                                                    ${
                                                        selected
                                                            ? 'bg-brand-teal-600 text-white shadow cursor-default'
                                                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center">
                                                    <tab.icon className="w-5 h-5" />

                                                    <span className="ml-2 whitespace-nowrap">
                                                        {tab.label}
                                                    </span>
                                                </div>
                                            </Tab>
                                        ))}
                                    </Tab.List>
                                </Tab.Group>
                            </div>
                        )}
                    </div>

                    {footnote && (
                        <p className="text-sm text-gray-500">{footnote}</p>
                    )}
                </div>
            </animated.div>
        </>
    )
}
