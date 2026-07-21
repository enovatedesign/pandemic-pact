import regionToCountryMapping from '@/data/source/region-to-country-mapping.json'
import selectOptions from '@/data/dist/select-options.json'

function buildCountryToRegionMap(): Record<string, string> {
    const map: Record<string, string> = {}
    for (const [regionId, codes] of Object.entries(regionToCountryMapping)) {
        for (const code of codes) {
            map[code] = regionId
        }
    }
    return map
}

const countryToRegion = buildCountryToRegionMap()

const countryNameByCode: Record<string, string> = Object.fromEntries(
    (selectOptions['ResearchLocationCountry'] as { value: string; label: string }[]).map((c) => [
        c.value,
        c.label,
    ])
)

const regionLabel = (regionId: string) =>
    (selectOptions['ResearchInstitutionRegion'] as { value: string; label: string }[])
        .find((o) => o.value === regionId)?.label ?? regionId

export const prepareGeographicalDistributionOfStudySubjectBarChartData = (studies: any[]) => {
    const grouped: Record<string, any[]> = {}

    studies.forEach((study) => {
        const seen = new Set<string>()
        ;(study['StudyCountry'] ?? []).forEach((iso: string) => {
            const regionId = countryToRegion[iso]
            if (regionId && regionId !== '-99' && !seen.has(regionId)) {
                seen.add(regionId)
                ;(grouped[regionId] ||= []).push(study)
            }
        })
    })

    return Object.entries(grouped)
        .map(([regionId, studies]) => ({
            label: regionLabel(regionId),
            region: regionId,
            numberOfStudies: studies.length,
        }))
        .sort((a, b) => b.numberOfStudies - a.numberOfStudies)
}

export const prepareCountryDrilldownData = (studies: any[], regionId: string) => {
    const regionCodes = new Set(
        regionToCountryMapping[regionId as keyof typeof regionToCountryMapping] ?? []
    )
    const grouped: Record<string, any[]> = {}

    studies.forEach((study) => {
        ;(study['StudyCountry'] ?? [])
            .filter((code: string) => regionCodes.has(code))
            .forEach((code: string) => {
                ;(grouped[code] ||= []).push(study)
            })
    })

    return Object.entries(grouped)
        .map(([code, studies]) => ({
            label: countryNameByCode[code] ?? code,
            countryCode: code,
            numberOfStudies: studies.length,
        }))
        .sort((a, b) => b.numberOfStudies - a.numberOfStudies)
}

function getRelatedStudies(studies: any[], entry: any): any[] {
    if ('region' in entry) {
        const regionCodes = new Set(
            regionToCountryMapping[entry.region as keyof typeof regionToCountryMapping] ?? []
        )
        return studies.filter((study) =>
            (study['StudyCountry'] ?? []).some((code: string) => regionCodes.has(code))
        )
    }
    return studies.filter((study) =>
        (study['StudyCountry'] ?? []).includes(entry.countryCode)
    )
}

export const addDomainCountsToEntries = (studies: any[], entries: any[]) => {
    return entries.map((entry) => {
        const relatedStudies = getRelatedStudies(studies, entry)
        const domainCounts: Record<string, number> = {}
        relatedStudies.forEach((study) => {
            ;(study['Domains'] ?? []).forEach((domain: string) => {
                domainCounts[domain] = (domainCounts[domain] || 0) + 1
            })
        })
        return { ...entry, ...domainCounts }
    })
}

export const prepareDomainSegmentTooltip = (
    studies: any[],
    entry: any,
    domain: string
): Array<{ label: string; count: number }> => {
    const domainStudies = getRelatedStudies(studies, entry).filter((study) =>
        (study['Domains'] ?? []).includes(domain)
    )

    const diseaseStudies: Record<string, number> = {}
    domainStudies.forEach((study) => {
        const seen = new Set<string>()
        ;(study['Diseases'] ?? []).forEach((disease: string) => {
            if (!seen.has(disease)) {
                seen.add(disease)
                diseaseStudies[disease] = (diseaseStudies[disease] || 0) + 1
            }
        })
    })

    return Object.entries(diseaseStudies)
        .map(([code, count]) => ({
            label:
                (selectOptions['Diseases'] as { value: string; label: string }[]).find(
                    (o) => o.value === code
                )?.label ?? code,
            count,
        }))
        .sort((a, b) => b.count - a.count)
}
