import type { ReactNode } from 'react'

import { ExternalLinkIcon } from '@heroicons/react/solid'

import InfoModal from '@/app/components/InfoModal'

import '@/app/css/components/breakout.css'

/**
 * A single "key fact" cell. Provide a `metric` for the default renderers, set
 * `isUrl` to render the value as a raw external link, supply `infoModalText` to
 * append an "i" info modal to the label, or pass a custom `render` for bespoke
 * cells (e.g. a start → end year range). Empty metrics fall back to "N/A".
 */
export type Fact = {
    text: string
    metric?: any
    infoModalText?: string
    isUrl?: boolean
    render?: (valueClassName: string) => ReactNode
}

// Value type scales, shared by both the Grants and Clinical Trials pages.
const LARGE_VALUE = 'text-lg md:text-3xl lg:text-4xl'
const DEFAULT_HEADING_VALUE = 'text-lg md:text-2xl lg:text-3xl'
const SUBHEADING_VALUE = 'text-lg lg:text-xl'

/**
 * Normalises a raw value for display: drops empty strings, "N/A" sentinels and
 * empty arrays (returning null so the fact can be filtered out), and trims array
 * members down to the meaningful ones.
 */
export function clean(value: any): any {
    if (Array.isArray(value)) {
        const filtered = value.filter(v => v && v !== 'N/A')
        return filtered.length > 0 ? filtered : null
    }

    if (value === undefined || value === null || value === '' || value === 'N/A') {
        return null
    }

    return value
}

function isEmpty(value: any): boolean {
    return (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    )
}

/** Renders a single metric, collapsing long arrays behind an InfoModal. */
function Metric({ metric }: { metric: any }) {
    // Normalise first so empty / "N/A" array members are dropped before we
    // slice, count or join — callers may pass raw arrays (e.g. the grants page).
    const cleaned = clean(metric)

    if (isEmpty(cleaned)) {
        return <span>N/A</span>
    }

    if (Array.isArray(cleaned)) {
        // Only collapse behind the InfoModal when there are more than three
        // values (matching the grants key-facts behaviour); up to three are
        // shown inline so a three-value heading isn't hidden behind a modal.
        const hasMore = cleaned.length > 3
        const visible = (hasMore ? cleaned.slice(0, 2) : cleaned).join(', ')

        return (
            <div>
                <span>{visible}</span>
                {hasMore && (
                    <span className="inline">
                        <span className="pl-1">…</span>
                        <InfoModal
                            customButton={
                                <span className="bg-secondary inline-block whitespace-nowrap text-white rounded-full ml-1 px-2 py-0.5 lg:-translate-y-1 text-sm">
                                    {cleaned.length - 2} more
                                </span>
                            }
                        >
                            <p>{cleaned.join(', ')}</p>
                        </InfoModal>
                    </span>
                )}
            </div>
        )
    }

    return <span>{cleaned}</span>
}

/** Renders a URL fact as a clickable link showing the raw URL. */
function UrlMetric({ url }: { url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 break-all underline hover:no-underline"
        >
            <span>{url}</span>
            <ExternalLinkIcon className="w-4 h-4 mt-0.5 shrink-0" />
        </a>
    )
}

type MobileCell = { row: number; col: number; full: boolean }

/**
 * Simulates the mobile (2-column) placement of the heading cells so spans and
 * borders can account for the full-width cells. The first and last facts span
 * the full width (one column); the rest flow two-per-row. When the count is odd,
 * the second-to-last fact also spans full width so no middle row is left
 * half-empty.
 */
function computeMobileMeta(total: number): { cells: MobileCell[]; lastRow: number } {
    const isFull = (i: number) =>
        i === 0 || i === total - 1 || (total % 2 === 1 && i === total - 2)

    const cells: MobileCell[] = []
    let row = 0
    let col = 0

    for (let i = 0; i < total; i++) {
        if (isFull(i)) {
            if (col !== 0) {
                row++
                col = 0
            }
            cells.push({ row, col: 0, full: true })
            row++
            col = 0
        } else {
            cells.push({ row, col, full: false })
            col++
            if (col === 2) {
                row++
                col = 0
            }
        }
    }

    return { cells, lastRow: cells.length ? cells[cells.length - 1].row : 0 }
}

/**
 * Border classes for a cell in the headings grid, which is irregular: on desktop
 * the first row holds two facts (2 columns) and every row below holds three; on
 * mobile the first/last (and, for odd counts, second-to-last) facts span the full
 * width with the rest in two columns. The last row in a given breakpoint omits its
 * bottom border (the <ul> draws the divider) and the right-most column / full-width
 * cells omit their right border, so nothing doubles up.
 */
function headingBorderClasses(
    index: number,
    total: number,
    mobile: MobileCell,
    mobileLastRow: number,
): string {
    const inFirstRow = index < 2

    // Desktop (md+): row 0 = 2 cols, then 3 cols per row.
    const mdCol = inFirstRow ? index : (index - 2) % 3
    const mdColsInRow = inFirstRow ? 2 : 3
    const mdRow = inFirstRow ? 0 : 1 + Math.floor((index - 2) / 3)
    const mdMaxRow = total <= 2 ? 0 : 1 + Math.floor((total - 3) / 3)

    const isFinalCell = index === total - 1

    return [
        !mobile.full && mobile.col === 0 && 'max-md:border-r-2',
        mobile.row !== mobileLastRow && 'max-md:border-b-2',
        mdCol < mdColsInRow - 1 && !isFinalCell && 'md:border-r-2',
        mdRow !== mdMaxRow && 'md:border-b-2',
    ]
        .filter(Boolean)
        .join(' ')
}

/**
 * Border classes for a cell in the subheadings grid: a single full-width column
 * on mobile, mdCols columns from md up. The last row drops its bottom border and
 * the right-most column / final cell drop their right border.
 */
function uniformBorderClasses(index: number, total: number, mdCols: number): string {
    const mdCol = index % mdCols
    const mdIsLastRow = Math.floor(index / mdCols) === Math.floor((total - 1) / mdCols)
    const isFinalCell = index === total - 1

    return [
        !isFinalCell && 'max-md:border-b-2',
        mdCol < mdCols - 1 && !isFinalCell && 'md:border-r-2',
        !mdIsLastRow && 'md:border-b-2',
    ]
        .filter(Boolean)
        .join(' ')
}

/** Label row for a cell, with an optional "i" info modal. */
function Label({ fact }: { fact: Fact }) {
    const label = (
        <p className="uppercase text-xs tracking-widest font-bold">{fact.text}</p>
    )

    if (!fact.infoModalText) {
        return label
    }

    return (
        <div className="flex items-center space-x-2">
            {label}
            <InfoModal>
                <p>{fact.infoModalText}</p>
            </InfoModal>
        </div>
    )
}

/** Value row for a cell: a custom render, a URL, or the default metric. */
function Value({ fact, valueClassName }: { fact: Fact; valueClassName: string }) {
    if (fact.render) {
        return <>{fact.render(valueClassName)}</>
    }

    if (fact.isUrl) {
        return (
            <div className="font-bold text-sm md:text-base">
                <UrlMetric url={fact.metric} />
            </div>
        )
    }

    return (
        <div className={`font-bold ${valueClassName}`}>
            <Metric metric={fact.metric} />
        </div>
    )
}

/** A single key-fact cell (label + value). */
function Cell({
    fact,
    className,
    valueClassName,
}: {
    fact: Fact
    className: string
    valueClassName: string
}) {
    return (
        <li
            className={`p-4 py-5 flex flex-col justify-between space-y-2 border-secondary/10 ${className}`}
        >
            <Label fact={fact} />
            <Value fact={fact} valueClassName={valueClassName} />
        </li>
    )
}

/**
 * Presentational "Key facts" panel shared by the Grants and Clinical Trials
 * detail pages. Callers map their data to `headings` / `subHeadings`; this
 * component owns the layout, responsive grid spans and dividers.
 *
 * - `largeHeadingCount` — how many leading headings use the large value type.
 * - `headingValueClassName` — value type for the remaining (non-large) headings.
 */
export default function KeyFacts({
    headings,
    subHeadings,
    largeHeadingCount = 2,
    headingValueClassName = DEFAULT_HEADING_VALUE,
}: {
    headings: Fact[]
    subHeadings: Fact[]
    largeHeadingCount?: number
    headingValueClassName?: string
}) {
    const { cells: mobileCells, lastRow: mobileLastRow } = computeMobileMeta(
        headings.length,
    )

    return (
        <div className="my-2 breakout-with-border overflow-hidden">
            <div className="relative flex flex-col lg:flex-row justify-start items-center w-full bg-secondary md:rounded-2xl overflow-hidden">
                <h2 className="self-start lg:self-auto px-4 py-2 lg:py-0 lg:px-4 text-white tracking-wider lg:[writing-mode:vertical-lr] uppercase text-lg lg:text-xl font-medium">
                    Key facts
                </h2>
                <div className="w-full bg-primary text-secondary">
                    <ul className="grid grid-cols-2 md:grid-cols-6 bg-gradient-to-t from-secondary/20 to-transparent to-50% border-b-2 border-secondary/30">
                        {headings.map((fact, index) => {
                            const mobile = mobileCells[index]

                            const colSpan = `${mobile.full ? 'col-span-2' : 'col-span-1'} ${index < 2 ? 'md:col-span-3' : 'md:col-span-2'}`

                            const valueClassName =
                                index < largeHeadingCount
                                    ? LARGE_VALUE
                                    : headingValueClassName

                            return (
                                <Cell
                                    key={index}
                                    fact={fact}
                                    valueClassName={valueClassName}
                                    className={`${colSpan} ${headingBorderClasses(index, headings.length, mobile, mobileLastRow)}`}
                                />
                            )
                        })}
                    </ul>
                    <ul className="grid grid-cols-2 md:grid-cols-3 bg-primary-lightest">
                        {subHeadings.map((fact, index) => (
                            <Cell
                                key={index}
                                fact={fact}
                                valueClassName={SUBHEADING_VALUE}
                                className={`col-span-2 md:col-span-1 ${uniformBorderClasses(index, subHeadings.length, 3)}`}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
