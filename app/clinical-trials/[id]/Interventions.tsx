'use client'

import { useState, useEffect, useRef } from 'react'
import AnimateHeight from 'react-animate-height'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { debounce } from 'lodash'

interface Props {
    trial: any
}

/**
 * Lists the trial's free-text intervention names as a read-more collapsible
 * block. Trial records have no Abstract / Lay Summary, so this is the direct
 * analogue of the grant page's AbstractAndLaySummary section.
 */
export default function Interventions({ trial }: Props) {
    const interventions: string[] = trial.InterventionNames ?? []

    if (interventions.length === 0) {
        return null
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8 lg:gap-12">
            <CollapsibleList title="Interventions" items={interventions} />
        </div>
    )
}

function CollapsibleList({ title, items }: { title: string; items: string[] }) {
    const contentRef = useRef<HTMLDivElement>(null)

    const [expanded, setExpanded] = useState(false)
    const [readMore, setReadMore] = useState(false)
    const [collapsedHeight, setCollapsedHeight] = useState<'auto' | number>('auto')

    useEffect(() => {
        const checkHeight = () => {
            const hasReadMore = (contentRef.current?.offsetHeight || 0) > 230
            setReadMore(hasReadMore)
            setCollapsedHeight(hasReadMore ? 230 : 'auto')
        }

        const debouncedCheckHeight = debounce(checkHeight, 200)

        if (document.readyState === 'complete') {
            checkHeight()
        } else {
            window.addEventListener('load', checkHeight)
        }

        window.addEventListener('resize', debouncedCheckHeight)

        return () => {
            window.removeEventListener('load', checkHeight)
            window.removeEventListener('resize', debouncedCheckHeight)
        }
    }, [items])

    return (
        <div className="flex flex-col space-y-4">
            <h3 className="text-secondary uppercase tracking-widest text-lg lg:text-xl font-medium">
                {title}
            </h3>

            <AnimateHeight
                duration={300}
                height={expanded ? 'auto' : collapsedHeight}
                className="relative"
            >
                <div ref={contentRef}>
                    <ul className="list-disc pl-5 space-y-2 max-w-none">
                        {items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                    {readMore && !expanded && (
                        <div className="absolute inset-0 top-0 left-0 bg-gradient-to-b from-transparent to-white transition duration-300" />
                    )}
                </div>
            </AnimateHeight>

            {readMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-auto uppercase font-bold tracking-wider flex items-center"
                >
                    <span className="inline-flex text-secondary">
                        {expanded ? 'read less' : 'read more'}
                    </span>
                    <ChevronDownIcon
                        className={`${
                            expanded && '-rotate-180'
                        } transition duration-300 w-8 h-8 text-secondary`}
                    />
                </button>
            )}
        </div>
    )
}
