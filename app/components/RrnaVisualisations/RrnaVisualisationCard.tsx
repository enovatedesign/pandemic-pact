import { ElementType, ReactNode, useState, useContext } from 'react'
import { Tab } from '@headlessui/react'
import { RrnaFilterContext } from '../../helpers/filters'
import ExportMenu from '../ExportMenu/ExportMenu'
import InfoModal from '../InfoModal'
import { useInView, animated } from '@react-spring/web'
import LogoInverted from '../LogoInverted'
import NumberOfActiveFilters from '../NumberOfActiveFilters'
import { fullRrnaDataFilename, rrnaFilteredDataFilename } from '@/app/helpers/export'

interface Props {
    id: string
    title: string
    subtitle?: string | ReactNode
    chartInstructions?: string
    footnote?: string
    infoModalContents?: ReactNode
    children?: ReactNode
    tabs?: Array<{
        tab: { icon: ElementType; label: string }
        content: ReactNode
    }>
    tabPrefixLabel?: string
}

export default function RrnaVisualisationCard({
    id,
    title,
    subtitle,
    chartInstructions,
    footnote,
    infoModalContents,
    children,
    tabs,
    tabPrefixLabel
}: Props) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    const { filters } = useContext(RrnaFilterContext)
    
    const appliedFilters = Object.entries(filters)
        .filter(([_, value]) => value.length > 0)
        .map(([key]) => key)

    const numberOfActiveFilters = appliedFilters.length
    
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
        },
    )

    return (
        <>
            <animated.div id={id} ref={ref} style={springs}>
                <div className="visualisation-card-wrapper flex flex-col items-start gap-y-6 h-full w-full bg-white p-6 lg:p-10 border-y-2 border-gray-200 lg:rounded-xl lg:border-2 relative">
                    <div className="flex flex-col items-start gap-y-6">
                        <div className="mr-16 z-10">
                            <h2 className="text-lg capitalize inline">
                                {title}
                            </h2>{' '}
                            {infoModalContents && (
                                <InfoModal customButtonClasses="align-middle -translate-y-[2px]">
                                    {infoModalContents}
                                </InfoModal>
                            )}
                        </div>

                        <NumberOfActiveFilters
                            id={id} 
                            numberOfActiveFilters={numberOfActiveFilters} 
                            appliedFilterLabels={appliedFilters}                        
                        />

                        {subtitle && (
                            <p className="text-brand-grey-600 max-w-none prose prose-a:text-secondary">
                                {subtitle}
                            </p>
                        )}

                        {chartInstructions && (
                            <p className="text-brand-grey-600">
                                {chartInstructions}
                            </p>
                        )}
                    </div>

                    {children}

                    {tabs && tabs[selectedTabIndex].content}

                    <div
                        className={`ignore-in-image-export w-full flex relative ${
                            !tabs
                                ? 'flex-col items-center md:flex-row-reverse md:justify-between'
                                : 'flex-row-reverse justify-between'
                        } gap-y-4 justify-between items-center md:gap-y-0`}
                    >
                        <ExportMenu
                            chartSelector={`#${id}`}
                            imageFilename={id}
                            filenameToFetch={fullRrnaDataFilename}
                            filteredFileName={rrnaFilteredDataFilename}
                            filterContext={RrnaFilterContext}
                            dataKey="studies"
                            filterIdKey="Rrnaid"
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
                                                            ? 'bg-brand-teal-700 text-white shadow cursor-default'
                                                            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-600'
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
                        <p className="text-sm text-gray-600">{footnote}</p>
                    )}

                    <div className="image-export-footer w-full flex flex-row items-center gap-12 hidden">
                        <div className="grow">
                            <p className="font-bold italic text-sm text-gray-600">
                                This image is licensed under a Creative Commons
                                Attribution-ShareAlike 4.0 International
                                License.
                            </p>
                            <p className="mt-3 italic text-sm text-gray-600">
                                Pandemic PACT Research Programme, Grant and
                                Evidence Gap Tracker by the Pandemic PACT Team
                                with GloPID-R and UKCDR (www.pandemicpact.org).
                            </p>
                        </div>

                        {/* Inline logo SVG so it's included in the image export */}
                        <LogoInverted className="w-40" />
                    </div>
                </div>
            </animated.div>
        </>
    )
}
