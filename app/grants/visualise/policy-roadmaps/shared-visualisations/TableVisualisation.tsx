"use client"

import { useState, useContext, useMemo, useCallback } from "react"
import { scaleLog } from 'd3-scale'
import { sumBy, uniq } from "lodash"

import hierarchyFilters from "@/public/manual-hierarchy-filters.json"
import selectOptions from "@/data/dist/select-options.json"

import { GlobalFilterContext } from "@/app/helpers/filters"
import { brandColours } from "@/app/helpers/colours"

import HeatmapTable, { HeatmapTableRow } from "@/app/components/HeatmapTable"

interface Props {
    id: string
    title: string
    subtitle: string
    columnHeadField: 'HundredDaysMissionResearchArea' | 'PandemicIntelligenceThemes'
    filenameToFetch?: string
    filteredFileName?: string
    footnote?: string
}

const TableVisualisation = ({
    id,
    title,
    subtitle,
    columnHeadField,
    filenameToFetch,
    filteredFileName,
    footnote
}: Props) => {
    const { grants } = useContext(GlobalFilterContext)
    const [activeFamily, setActiveFamily] = useState<string | null>(null)
    const columnOptions = selectOptions[columnHeadField as keyof typeof selectOptions]

    const calculateRelatedData = useCallback((
        field: string,
        value: string
    ) => {
        return columnOptions.map(({ label: optionLabel, value: optionValue }) => {
            const relatedGrants = uniq(grants.filter(grant =>
                grant[field].includes(value) &&
                grant[columnHeadField].includes(optionValue)
            )).length

            return {
                optionLabel,
                count: relatedGrants
            }
        })
    }, [grants, columnOptions, columnHeadField])

    const maxCount = useMemo(() => {
        return Math.max(
            ...hierarchyFilters.flatMap(({ value: familyValue, pathogens }) => {
                const familyCounts = calculateRelatedData("Families", familyValue).map(({ count }) => count)

                const pathogenCounts = pathogens
                    .filter(p => !["Unspecified", "Other"].includes(p.label))
                    .flatMap(({ value: pathogenValue }) => calculateRelatedData("Pathogens", pathogenValue).map(({ count }) => count))

                return [...familyCounts, ...pathogenCounts]
            })
        )
    }, [calculateRelatedData])

    const colourScale = useMemo(
        () =>
            scaleLog<string>()
                .domain([1, maxCount])
                .range([brandColours['teal']['300'], brandColours['teal']['700']]),
        [maxCount],
    )

    // Build the flat, already-expanded row list for the shared table.
    const rows = useMemo<HeatmapTableRow[]>(() => {
        const result: HeatmapTableRow[] = []

        hierarchyFilters.forEach(({ label: familyLabel, value: familyValue, pathogens }) => {
            const familyCounts = calculateRelatedData("Families", familyValue)

            result.push({
                key: familyLabel,
                label: familyLabel,
                variant: 'parent',
                counts: familyCounts.map(({ count }) => count),
                total: sumBy(familyCounts, 'count'),
                expanded: activeFamily === familyLabel,
                onToggle: () =>
                    setActiveFamily(activeFamily === familyLabel ? null : familyLabel),
            })

            if (activeFamily === familyLabel) {
                pathogens
                    .filter(p => !["Unspecified", "Other"].includes(p.label))
                    .forEach(({ label: pathogenLabel, value: pathogenValue }) => {
                        const pathogenCounts = calculateRelatedData("Pathogens", pathogenValue)
                        result.push({
                            key: pathogenLabel,
                            label: pathogenLabel,
                            variant: 'child',
                            counts: pathogenCounts.map(({ count }) => count),
                            total: sumBy(pathogenCounts, 'count'),
                        })
                    })
            }
        })

        return result
    }, [activeFamily, calculateRelatedData])

    return (
        <HeatmapTable
            id={id}
            title={title}
            subtitle={subtitle}
            footnote={footnote}
            filenameToFetch={filenameToFetch}
            filteredFileName={filteredFileName}
            columnLabels={columnOptions.map(({ label }) => label)}
            rows={rows}
            colourScale={colourScale}
        />
    )
}

export default TableVisualisation
