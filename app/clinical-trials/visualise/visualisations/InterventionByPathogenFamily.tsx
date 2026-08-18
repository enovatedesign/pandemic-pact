'use client'

import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { scaleLog } from 'd3-scale'
import { sumBy } from 'lodash'

import hierarchyFilters from '@/public/manual-hierarchy-filters.json'
import HeatmapTable, { HeatmapTableRow } from '../../../components/HeatmapTable'
import {
    clinicalTrialsFullDataFilename,
    clinicalTrialsFilteredDataFilename,
} from '../../../helpers/export'
import { GlobalFilterContext } from '../../../helpers/filters'
import { brandColours } from '../../../helpers/colours'

/**
 * Visualisation 4 — Distribution of clinical research intervention by pathogen
 * family. Heat-mapped matrix (shared HeatmapTable): families as expandable dark
 * rows, teal-gradient count cells, a per-row Total column, plus a per-intervention
 * column-totals footer (Technical Spec Viz 4).
 *
 * Families/pathogens come from the shared PACT taxonomy in
 * `manual-hierarchy-filters.json` — the same source the grants pandemic-intelligence
 * matrix uses — so the two stay consistent (Viz 4: "must remain consistent with
 * funding matrix logic"). The CT and grants datasets share an identical
 * family/pathogen/disease coding, so this single source serves both. Sentinel
 * pathogens (Other / Unspecified) are filtered out by label, matching that matrix.
 */

type Option = { value: string; label: string }
type HierarchyPathogen = { value: string; label: string }
type HierarchyFamily = { value: string; label: string; pathogens: HierarchyPathogen[] }

// Real intervention categories (exclude the 88/99/9999 sentinels as columns).
const INTERVENTION_CODES = ['1', '2', '3', '4', '5']
// Sentinel pathogen rows excluded from the matrix — filtered by label, exactly as
// the grants pandemic-intelligence matrix (TableVisualisation) does.
const SENTINEL_PATHOGEN_LABELS = ['Other', 'Unspecified']

// Families (with sentinel pathogens stripped) derived once from the shared,
// static taxonomy.
const families = (hierarchyFilters as unknown as HierarchyFamily[]).map(family => ({
    code: family.value,
    label: family.label,
    pathogens: family.pathogens.filter(
        p => !SENTINEL_PATHOGEN_LABELS.includes(p.label),
    ),
}))

export default function InterventionByPathogenFamily() {
    const { grants: trials } = useContext(GlobalFilterContext)

    const [interventionOptions, setInterventionOptions] = useState<Option[]>([])
    const [activeFamily, setActiveFamily] = useState<string | null>(null)

    useEffect(() => {
        fetch('/data/clinical-trials/select-options/Interventions.json')
            .then(res => (res.ok ? res.json() : []))
            .then((opts: Option[]) =>
                setInterventionOptions(
                    opts.filter(o => INTERVENTION_CODES.includes(o.value)),
                ),
            )
            .catch(() => setInterventionOptions([]))
    }, [])

    // Single pass over trials, tallying — per taxonomy value — how many trials
    // fall under each intervention. Replaces the previous per-cell `.filter()`
    // scans, which re-walked the whole dataset O(values × interventions) times
    // per render (across maxCount, columnTotals and rows).
    const { familyCounts, pathogenCounts } = useMemo(() => {
        const interventionCodeSet = new Set(interventionOptions.map(o => o.value))
        const family = new Map<string, Record<string, number>>()
        const pathogen = new Map<string, Record<string, number>>()

        const bump = (
            map: Map<string, Record<string, number>>,
            key: string,
            interventionCode: string,
        ) => {
            const row = map.get(key) ?? {}
            row[interventionCode] = (row[interventionCode] ?? 0) + 1
            map.set(key, row)
        }

        trials.forEach((trial: any) => {
            // Dedupe each array so a trial is counted at most once per
            // (taxonomy value, intervention) cell — matching the previous
            // set-membership (`.includes()`) semantics even when a record lists
            // the same code more than once.
            const interventions = Array.from(
                new Set<string>(
                    (trial.Interventions ?? []).filter((code: string) =>
                        interventionCodeSet.has(code),
                    ),
                ),
            )
            if (interventions.length === 0) return

            const trialFamilies = Array.from(new Set<string>(trial.Families ?? []))
            const trialPathogens = Array.from(new Set<string>(trial.Pathogens ?? []))

            interventions.forEach(interventionCode => {
                trialFamilies.forEach(code => bump(family, code, interventionCode))
                trialPathogens.forEach(code => bump(pathogen, code, interventionCode))
            })
        })

        return { familyCounts: family, pathogenCounts: pathogen }
    }, [trials, interventionOptions])

    // Per-column counts for a given taxonomy value (Families or Pathogens), read
    // from the precomputed tally above.
    const countsFor = useCallback(
        (field: 'Families' | 'Pathogens', value: string) => {
            const row =
                (field === 'Families' ? familyCounts : pathogenCounts).get(value) ?? {}
            return interventionOptions.map(option => ({
                optionLabel: option.label,
                count: row[option.value] ?? 0,
            }))
        },
        [familyCounts, pathogenCounts, interventionOptions],
    )

    // Colour scale derived from cell counts only (so totals read as the darkest).
    const maxCount = useMemo(() => {
        const counts = families.flatMap(family => {
            const familyCellCounts = countsFor('Families', family.code).map(c => c.count)
            const pathogenCellCounts = family.pathogens.flatMap(p =>
                countsFor('Pathogens', p.value).map(c => c.count),
            )
            return [...familyCellCounts, ...pathogenCellCounts]
        })
        return Math.max(2, ...counts)
    }, [countsFor])

    const colourScale = useMemo(
        () =>
            scaleLog<string>()
                .domain([1, maxCount])
                .range([brandColours.teal['300'], brandColours.teal['700']])
                .clamp(true),
        [maxCount],
    )

    // Per-intervention column totals (sum across families) + grand total, read
    // from the same precomputed tally rather than re-scanning trials.
    const columnTotals = useMemo(
        () =>
            interventionOptions.map(option =>
                families.reduce(
                    (sum, family) =>
                        sum + (familyCounts.get(family.code)?.[option.value] ?? 0),
                    0,
                ),
            ),
        [interventionOptions, familyCounts],
    )
    const grandTotal = useMemo(() => sumBy(columnTotals, n => n), [columnTotals])

    // Build the flat, already-expanded row list for the shared table.
    const rows = useMemo<HeatmapTableRow[]>(() => {
        const result: HeatmapTableRow[] = []

        families.forEach(family => {
            const familyCellCounts = countsFor('Families', family.code)

            result.push({
                key: family.code,
                label: family.label,
                variant: 'parent',
                counts: familyCellCounts.map(c => c.count),
                total: sumBy(familyCellCounts, 'count'),
                expanded: activeFamily === family.code,
                onToggle: () =>
                    setActiveFamily(activeFamily === family.code ? null : family.code),
            })

            if (activeFamily === family.code) {
                family.pathogens.forEach(pathogen => {
                    const pathogenCellCounts = countsFor('Pathogens', pathogen.value)
                    result.push({
                        key: `${family.code}-${pathogen.value}`,
                        label: pathogen.label,
                        variant: 'child',
                        counts: pathogenCellCounts.map(c => c.count),
                        total: sumBy(pathogenCellCounts, 'count'),
                    })
                })
            }
        })

        return result
    }, [activeFamily, countsFor])

    return (
        <HeatmapTable
            id="ct-intervention-by-pathogen-family"
            dataset="clinical-trials"
            filenameToFetch={clinicalTrialsFullDataFilename}
            filteredFileName={clinicalTrialsFilteredDataFilename}
            title="Distribution of clinical research intervention by pathogen family"
            subtitle="Records may fall under more than one family or pathogen, or include research on more than one intervention hence the totals shown may exceed actual counts."
            columnLabels={interventionOptions.map(o => o.label)}
            rows={rows}
            totalsRow={{ label: 'Total', counts: columnTotals, total: grandTotal }}
            colourScale={colourScale}
        />
    )
}
