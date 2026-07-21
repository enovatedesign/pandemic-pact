import { flatMap, groupBy } from "lodash"
import { rrnaAgeGroupColours } from "@/app/helpers/colours"
import { RRNA_DOMAIN_ORDER, RRNA_POPULATION_ORDER, orderByReference } from "@/app/helpers/rrnaConstants"

export const prepareStudiesByDomainAndStudyPopulationChartData = (studies: any[], includePregnantWomen: boolean = true) => {
    const studiesGroupedByDomain = groupBy(
        flatMap(studies, (study) =>
            Array.isArray(study.Domains)
                ? study.Domains.map((domain: string) => ({ ...study, researchDomain: domain }))
                : []
        ),
        'researchDomain'
    )

    const includeAgeGroup = (ageGroup: string) =>
        RRNA_POPULATION_ORDER.includes(ageGroup as any) &&
        (includePregnantWomen || ageGroup !== 'Pregnant women')

    const domainLabels = orderByReference(Object.keys(studiesGroupedByDomain), RRNA_DOMAIN_ORDER)

    const chartData = domainLabels.map((researchDomain) => {
        const domainStudies = studiesGroupedByDomain[researchDomain] as any[]

        const ageGroupCounts = domainStudies.reduce<Record<string, number>>((acc, study) => {
            const ageGroups = Array.isArray(study.AgeGroupsRrna) ? study.AgeGroupsRrna : []
            ageGroups.filter(includeAgeGroup).forEach((ageGroup: string) => {
                acc[ageGroup] = (acc[ageGroup] || 0) + 1
            })
            return acc
        }, {})

        // Insert population keys in canonical order (Children → Adults →
        // Pregnant women → Not reported) so the stacked bar renders in order.
        const orderedCounts: Record<string, number> = {}
        orderByReference(Object.keys(ageGroupCounts), RRNA_POPULATION_ORDER).forEach((ageGroup) => {
            orderedCounts[ageGroup] = ageGroupCounts[ageGroup]
        })

        return {
            label: researchDomain,
            totalCount: domainStudies.length,
            ...orderedCounts,
        }
    })

    const highestValue = Math.max(1, ...chartData.map((item) => item.totalCount))

    const presentAgeGroups = orderByReference(
        Array.from(new Set(
            flatMap(studies, (study) => Array.isArray(study.AgeGroupsRrna) ? study.AgeGroupsRrna : [])
                .filter(includeAgeGroup)
        )),
        RRNA_POPULATION_ORDER
    )

    const legend = presentAgeGroups.map((ageGroup) => ({
        label: ageGroup,
        colour: rrnaAgeGroupColours[ageGroup as keyof typeof rrnaAgeGroupColours]
    }))

    return {
        chartData,
        highestValue,
        legend
    }
}
