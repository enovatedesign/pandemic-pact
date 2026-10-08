import { useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { MinusIcon, PlusIcon } from '@heroicons/react/solid'
import { GlobalFilterContext } from '../../helpers/filters'
import { getColoursByField, isChartDataUnavailable, prepareBarListDataForCategory, BarListDatum } from '../../helpers/bar-list'
import { ebolaScopeColours } from '../../helpers/colours'
import { ImageExportContext } from '../../helpers/image-export'
import selectOptions from '../../../data/dist/select-options.json'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import { FallbackData } from '../CategoryAndSubcategoryBarList/AllSubCategories'
import InfoModal from '../InfoModal'
import Button from '../Button'
import ScopePill, { Scope } from './ScopePill'

type PriorityOption = { value: string, label: string, description?: string }
type SubPriorityOption = { value: string, label: string, parent: string, scope: Scope }

const priorityOptions = selectOptions.EbolaResearchPriorities as PriorityOption[]
const subPriorityOptions = selectOptions.EbolaResearchSubPriorities as SubPriorityOption[]
const allPriorityValues = priorityOptions.map(({ value }) => value)

// Charts in panels that were never opened only size themselves once visible
const waitForChartsToRender = async (container: HTMLElement | null, timeoutMs = 3000) => {
    const startedAt = Date.now()

    const allRendered = () => [...(container?.querySelectorAll('.recharts-responsive-container') ?? [])]
        .every(chart => chart.querySelector('.recharts-surface'))

    while (!allRendered() && Date.now() - startedAt < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }
}

export default function PrioritiesAccordion() {
    const { grants } = useContext(GlobalFilterContext)
    const { registerPreparer } = useContext(ImageExportContext)

    const [openPriorities, setOpenPriorities] = useState<string[]>([])
    const [isExporting, setIsExporting] = useState(false)

    const idPrefix = useId()
    const containerRef = useRef<HTMLDivElement>(null)

    // Header rows and sub-priority rows go into one BarList so both share a bar scale
    const [priorityData, subPriorityData] = useMemo(() => [
        priorityOptions.map(option => prepareBarListDataForCategory(grants, option, 'EbolaResearchPriorities')),
        subPriorityOptions.map(option => prepareBarListDataForCategory(grants, option, 'EbolaResearchSubPriorities')),
    ], [grants])

    const barListData = useMemo(() => [...priorityData, ...subPriorityData], [priorityData, subPriorityData])
    const dataIndexByValue = useMemo(
        () => new Map(barListData.map((datum, index) => [datum['Category Value'], index])),
        [barListData],
    )

    useEffect(() => registerPreparer(async () => {
        let previouslyOpen: string[] = []

        setIsExporting(true)
        setOpenPriorities(open => {
            previouslyOpen = open

            return allPriorityValues
        })

        await waitForChartsToRender(containerRef.current)

        return () => {
            setOpenPriorities(previouslyOpen)
            setIsExporting(false)
        }
    }), [registerPreparer])

    const { brightColours, dimColours } = getColoursByField('EbolaResearchPriorities')

    if (isChartDataUnavailable(priorityData)) {
        return <FallbackData />
    }

    const allOpen = openPriorities.length === allPriorityValues.length

    const togglePriority = (value: string) => setOpenPriorities(open =>
        open.includes(value) ? open.filter(openValue => openValue !== value) : [...open, value],
    )

    return (
        <div ref={containerRef} className="space-y-4">
            <div className="ignore-in-image-export flex justify-end">
                <Button
                    type="button"
                    size="xsmall"
                    customClasses="flex items-center gap-1 normal-case"
                    onClick={() => setOpenPriorities(allOpen ? [] : allPriorityValues)}
                >
                    {allOpen ? 'Collapse all' : 'Expand all'}
                    {allOpen ? <MinusIcon className="size-5" aria-hidden="true" /> : <PlusIcon className="size-5" aria-hidden="true" />}
                </Button>
            </div>

            <BarList
                data={barListData}
                brightColours={brightColours}
                dimColours={dimColours}
                isAnimationActive={isExporting ? false : 'auto'}
            >
                {priorityOptions.map(({ value, label, description }) => {
                    const isOpen = openPriorities.includes(value)
                    const panelId = `${idPrefix}-panel-${value}`
                    const scope = subPriorityOptions.find(({ parent }) => parent === value)?.scope ?? 'all'
                    const subPriorities = subPriorityData.filter((_, subIndex) => subPriorityOptions[subIndex].parent === value)

                    const ToggleIcon = isOpen ? MinusIcon : PlusIcon

                    return (
                        <div
                            key={value}
                            className={`col-span-4 grid grid-cols-subgrid overflow-hidden rounded-2xl border-2 bg-white mt-4`}
                            style={{ borderColor: ebolaScopeColours[scope] }}
                        >
                            <div className="col-span-4 grid grid-cols-subgrid gap-y-1 px-6 py-4">
                                {/* The button stretches over the whole header line; the pill and info icon sit above it */}
                                <div className="relative col-span-4 flex items-start justify-between gap-x-4">
                                    <h3 className="text-base lg:text-lg">
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            onClick={() => togglePriority(value)}
                                            className="text-left after:absolute after:inset-0 after:content-['']"
                                        >
                                            {value}. {label}{' '}
                                            <span className="ignore-in-image-export text-sm text-gray-500">(click to see breakdown)</span>
                                        </button>
                                    </h3>

                                    <div className="flex items-center gap-x-2 shrink-0">
                                        <div className="relative z-10 flex items-center gap-x-1">
                                            <ScopePill scope={scope} />

                                            {description && (
                                                <InfoModal customButtonClasses="ml-1" iconSize="size-5">
                                                    {description.split('\n\n').map(paragraph => (
                                                        <p key={paragraph}>{paragraph}</p>
                                                    ))}
                                                </InfoModal>
                                            )}
                                        </div>

                                        <ToggleIcon className="ignore-in-image-export size-6 text-primary" aria-hidden="true" />
                                    </div>
                                </div>

                                <BarListRow dataIndex={dataIndexByValue.get(value) ?? -1} />
                            </div>

                            <AnimateHeight
                                id={panelId}
                                height={isOpen ? 'auto' : 0}
                                duration={isExporting ? 0 : 300}
                                className="col-span-4 grid grid-cols-subgrid"
                                contentClassName="col-span-4 grid grid-cols-subgrid gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-6 py-4"
                            >
                                {subPriorities.map((datum: BarListDatum) => (
                                    <div
                                        key={datum['Category Value']}
                                        role="group"
                                        aria-label={datum['Category Label']}
                                        className="col-span-4 grid grid-cols-subgrid gap-y-1 mb-3 last:mb-0"
                                    >
                                        <BarListRowHeading>
                                            <p className="bar-chart-category-label text-gray-600 text-sm">
                                                {datum['Category Label']}
                                            </p>
                                        </BarListRowHeading>

                                        <BarListRow dataIndex={dataIndexByValue.get(datum['Category Value']) ?? -1} />
                                    </div>
                                ))}
                            </AnimateHeight>
                        </div>
                    )
                })}
            </BarList>
        </div>
    )
}
