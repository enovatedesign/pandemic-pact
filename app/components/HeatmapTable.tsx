'use client'

import { memo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { ColorTranslator } from 'colortranslator'

import VisualisationCard from './VisualisationCard'
import { DatasetKey } from '../helpers/datasets'

/**
 * A heat-mapped matrix table shared by the clinical-trials "intervention by
 * pathogen family" visualisation and the grants policy-roadmap table
 * visualisation. Parents (families) are dark, expandable rows; children
 * (pathogens) are lighter rows. Count cells are coloured by a caller-supplied
 * scale; their text colour flips to white on darker cells for contrast, and
 * hovering a row highlights its top and bottom borders.
 *
 * Callers own the data (hierarchy, counts, colour scale) and pass a flat list of
 * already-expanded rows; this component is purely presentational.
 */

export interface HeatmapTableRow {
    key: string
    label: string
    /** 'parent' = dark family row (chevron + toggle); 'child' = lighter pathogen row. */
    variant: 'parent' | 'child'
    /** One count per column, in column order. */
    counts: number[]
    /** Row total (rendered in the trailing Total column). */
    total: number
    /** Parent only: whether the row is expanded (rotates the chevron). */
    expanded?: boolean
    /** Parent only: toggle handler. */
    onToggle?: () => void
}

interface Props {
    id: string
    title: string
    subtitle?: string
    footnote?: string
    dataset?: DatasetKey
    filenameToFetch?: string
    filteredFileName?: string
    columnLabels: string[]
    rows: HeatmapTableRow[]
    /** Optional totals footer row. */
    totalsRow?: { label: string; counts: number[]; total: number }
    /** Maps a count to a background colour (e.g. a d3 log scale). */
    colourScale: (count: number) => string
}

// Row separators are drawn with a single bottom border per cell (so adjacent rows
// never stack two borders). Borders are primary by default; hovering a row turns
// both the line below it (its own bottom border) and the line above it (the
// preceding row's bottom border, selected with :has) white — so the hovered row
// gets a clean single-line white outline top and bottom, with no doubling.
const SEPARATOR_CLASSES =
    'border-b border-b-primary group-hover:border-b-white [tr:has(+_tr:hover)>&]:border-b-white'

// The first body row's top line is the header's bottom border (a different table
// section, so the :has sibling rule above can't reach it). Whiten the header's
// bottom border when the first body row is hovered so that row highlights too.
const HEADER_HOVER_TOP =
    '[thead:has(+_tbody>tr:first-child:hover)_&]:border-b-white'

const HeatmapTable = ({
    id,
    title,
    subtitle,
    footnote,
    dataset,
    filenameToFetch,
    filteredFileName,
    columnLabels,
    rows,
    totalsRow,
    colourScale,
}: Props) => {
    const tableHeadBaseClasses = `w-80 px-4 py-2 bg-secondary text-white border-b border-primary ${HEADER_HOVER_TOP}`

    return (
        <VisualisationCard
            id={id}
            dataset={dataset}
            title={title}
            subtitle={subtitle}
            footnote={footnote}
            filenameToFetch={filenameToFetch}
            filteredFileName={filteredFileName}
        >
            <div className="table-visualisation-wrapper w-full overflow-x-auto">
                <table className="border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th className={`bg-secondary w-80 border-b border-primary ${HEADER_HOVER_TOP}`}></th>
                            {columnLabels.map(label => (
                                <th
                                    key={label}
                                    className={`${tableHeadBaseClasses} border-l`}
                                >
                                    {label}
                                </th>
                            ))}
                            <th className={`${tableHeadBaseClasses} border-l`}>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(row => (
                            <tr
                                key={row.key}
                                className={`group ${row.onToggle ? 'cursor-pointer' : ''}`}
                                onClick={row.onToggle}
                            >
                                {row.variant === 'parent' ? (
                                    <td
                                        className={`px-4 py-2 text-white font-bold text-left text-lg bg-secondary flex items-center justify-between gap-x-2 ${SEPARATOR_CLASSES}`}
                                    >
                                        {row.label}
                                        <ChevronDownIcon
                                            className={`size-6 text-white transition-transform ${
                                                row.expanded ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </td>
                                ) : (
                                    <td
                                        className={`px-4 py-2 text-secondary font-bold text-left bg-primary-darker ${SEPARATOR_CLASSES}`}
                                    >
                                        {row.label}
                                    </td>
                                )}

                                {row.counts.map((count, i) => (
                                    <CountCell
                                        key={i}
                                        count={count}
                                        colourScale={colourScale}
                                    />
                                ))}

                                <CountCell count={row.total} colourScale={colourScale} />
                            </tr>
                        ))}
                    </tbody>

                    {totalsRow && (
                        <tfoot>
                            <tr className="group">
                                <td
                                    className={`px-4 py-2 text-white font-bold text-left text-lg bg-secondary ${SEPARATOR_CLASSES}`}
                                >
                                    {totalsRow.label}
                                </td>
                                {totalsRow.counts.map((count, i) => (
                                    <CountCell
                                        key={i}
                                        count={count}
                                        colourScale={colourScale}
                                    />
                                ))}
                                <CountCell count={totalsRow.total} colourScale={colourScale} />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </VisualisationCard>
    )
}

export default HeatmapTable

/** Choose white or dark text for adequate contrast against the cell background. */
function getReadableTextColourClass(backgroundColour: string): string {
    try {
        const { R, G, B } = new ColorTranslator(backgroundColour)
        const luminance = 0.299 * R + 0.587 * G + 0.114 * B
        return luminance < 150 ? 'text-white' : 'text-secondary'
    } catch {
        return 'text-secondary'
    }
}

// Memoised: a table can render 100+ cells and each computes its colour/contrast
// via ColorTranslator. With a stable colourScale (the callers memoise theirs),
// cells only re-render when their own count changes.
const CountCell = memo(function CountCell({
    count,
    colourScale,
}: {
    count: number
    colourScale: (count: number) => string
}) {
    const backgroundColour = count === 0 ? colourScale(1) : colourScale(count)
    const textColourClass = getReadableTextColourClass(backgroundColour)

    return (
        <td
            className={`${textColourClass} font-bold text-center px-4 py-2 border-l border-primary ${SEPARATOR_CLASSES}`}
            style={{ backgroundColor: backgroundColour }}
        >
            {count}
        </td>
    )
})
