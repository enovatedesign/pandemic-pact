import { ArrowRightIcon } from '@heroicons/react/solid'

import KeyFacts, { type Fact } from '@/app/components/KeyFacts'

export default function GrantKeyFacts({ grant }: { grant: any }) {
    const startYear = grant.GrantStartYear
    const endYear = grant.GrantEndYear

    const investigators = grant.InvestigatorNames.map(
        (investigator: { title: string; firstName: string; lastName: string }) =>
            Object.values(investigator)
                .filter(value => value)
                .join(' '),
    ).join(', ')

    const headings: Fact[] = [
        { text: 'Disease', metric: grant.Diseases },
        {
            // `metric` doubles as the truthiness used by the filter below.
            text: endYear < 0 ? 'start year' : 'Start & end year',
            metric: startYear,
            render: (valueClassName: string) => (
                <div className="flex gap-1 items-center">
                    <span className={`font-bold ${valueClassName}`}>{startYear}</span>
                    {endYear > 0 && (
                        <div className="flex gap-1 items-end h-full">
                            <div className="flex items-center gap-1">
                                <ArrowRightIcon className="w-4 h-4 md:h-5 md:w-5 opacity-50" />
                                <span className="text-md md:text-xl lg:text-2xl font-bold">
                                    {endYear}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            text: 'Known Financial Commitments (USD)',
            metric:
                typeof grant.GrantAmountConverted === 'number'
                    ? '$' + grant.GrantAmountConverted.toLocaleString()
                    : grant.GrantAmountConverted,
        },
        { text: 'Funder', metric: grant.FundingOrgName.join(', ') },
        { text: 'Principal Investigator', metric: investigators },
        { text: 'Research Location', metric: grant.ResearchLocationCountry },
        { text: 'Lead Research Institution', metric: grant.ResearchInstitutionName },
        { text: 'Partner Institution', metric: null },
        { text: 'Research Priority Alignment', metric: 'N/A' },
    ].filter(heading => heading.metric)

    const subHeadings: Fact[] = [
        { text: 'Research Category', metric: grant.ResearchCat[0] },
        { text: 'Research Subcategory', metric: grant.ResearchSubcat[0] },
        { text: 'Special Interest Tags', metric: grant.Tags },
        { text: 'Study Type', metric: grant.StudyType[0] },
        { text: 'Clinical Trial Details', metric: grant.ClinicalTrial[0] },
        { text: 'Broad Policy Alignment', metric: 'Pending' },
        {
            text: 'Age Group',
            metric: grant.AgeGroups,
            infoModalText:
                'We curated data on the age groups using information from the grant summary when available. If no age criteria were specified, we coded the field as unspecified. If a grant summary described a research project conducted on viruses or other non-human subjects, we coded the field as not applicable.',
        },
        {
            text: 'Vulnerable Population',
            metric: grant.VulnerablePopulations,
            infoModalText:
                'We curated data on the vulnerable populations using information on special populations from the grant summary. If a grant was awarded to conduct research involving participants with recognised vulnerabilities, we used this information to populate the field. If no vulnerabilities were mentioned, we coded the field as unspecified. If the grant was awarded to conduct research on the non-human populations, including viruses or other, we coded the field as not applicable.',
        },
        { text: 'Occupations of Interest', metric: grant.OccupationalGroups },
    ]

    if (grant.Diseases.includes('mpox')) {
        subHeadings.push({
            text: 'Mpox Research Priorities',
            metric: grant.GlobalMpoxResearchPriorities,
        })

        subHeadings.push({
            text: 'Mpox Research Sub Priorities',
            metric: grant.GlobalMpoxResearchSubPriorities,
        })
    }

    return (
        <KeyFacts
            headings={headings}
            subHeadings={subHeadings}
            largeHeadingCount={3}
            headingValueClassName="text-lg lg:text-xl"
        />
    )
}
