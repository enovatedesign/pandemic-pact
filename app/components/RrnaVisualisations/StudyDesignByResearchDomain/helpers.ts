import { rrnaStudyDesignColours } from "@/app/helpers/colours"
import { RRNA_DOMAIN_ORDER, RRNA_STUDY_DESIGN_ORDER, orderByReference } from "@/app/helpers/rrnaConstants"
import { flatMap, groupBy } from "lodash"

/*
   Each study records a single study design (interventional or observational),
   combined into the StudyDesign field during data preparation. The chart stacks
   by study design directly, with no intermediate observational / interventional
   grouping layer (see RRNA Technical Specification §6).
*/
const getStudyDesign = (study: any): string | null =>
    study.StudyDesign || study.InterventionalStudyDesign || study.ObservationalStudyDesign || null

export const prepareStudyDesignByDomainChartData = (studies: any[]) => {
    const studiesGroupedByDomain = groupBy(
        flatMap(studies, (study) =>
            Array.isArray(study.Domains)
                ? study.Domains.map((domain: string) => ({ ...study, researchDomain: domain }))
                : []
        ),
        'researchDomain'
    )

    const domainLabels = orderByReference(Object.keys(studiesGroupedByDomain), RRNA_DOMAIN_ORDER)

    const chartData = domainLabels.map((researchDomain) => {
        const domainStudies = studiesGroupedByDomain[researchDomain] as any[]

        const designCounts = domainStudies.reduce<Record<string, number>>((acc, study) => {
            const design = getStudyDesign(study)
            if (design) {
                acc[design] = (acc[design] || 0) + 1
            }
            return acc
        }, {})

        // Insert the study-design keys in canonical order so the stacked bar
        // renders highest-level-of-evidence first.
        const orderedCounts: Record<string, number> = {}
        orderByReference(Object.keys(designCounts), RRNA_STUDY_DESIGN_ORDER).forEach((design) => {
            orderedCounts[design] = designCounts[design]
        })

        return {
            label: researchDomain,
            totalCount: domainStudies.length,
            ...orderedCounts,
        }
    })

    const highestValue = Math.max(1, ...chartData.map(item => item.totalCount))

    // Legend: only the study designs actually present, in canonical order.
    const presentDesigns = orderByReference(
        Array.from(new Set(studies.map(getStudyDesign).filter(Boolean) as string[])),
        RRNA_STUDY_DESIGN_ORDER
    )

    const legend = presentDesigns.map((design) => ({
        label: design,
        colour: rrnaStudyDesignColours[design as keyof typeof rrnaStudyDesignColours],
    }))

    return {
        chartData,
        highestValue,
        legend,
    }
}
