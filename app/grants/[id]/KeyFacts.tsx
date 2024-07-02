import { ArrowRightIcon } from '@heroicons/react/solid'
import InfoModal from '../../components/InfoModal'

import '/app/css/components/breakout.css'

export default function KeyFacts({ grant }: { grant: any }) {
    const keyFactsHeadings = [
        {
            text: 'Disease',
            metric: grant.Disease,
        },
        {
            text: 'Start & end year',
            startMetric: grant.GrantStartYear,
            endMetric: grant.GrantEndYear,
        },
        {
            text: 'Known Financial Commitments (USD)',
            metric: typeof grant.GrantAmountConverted === 'number' ? '$' + grant.GrantAmountConverted.toLocaleString() : grant.GrantAmountConverted,
        },
        {
            text: 'Funder',
            metric: grant.FundingOrgName.join(', '),
        },
        {
            text: 'Principle Investigator',
            metric: grant.PrincipleInvestigator ?? 'Pending',
        },
        {
            text: 'Research Location',
            metric: grant.ResearchLocationCountry,
        },
        {
            text: 'Lead Research Institution',
            metric: grant.ResearchInstitutionName,
        },
        {
            text: 'Partner Institution',
            metric: null,
        },
        {
            text: 'Research Priority Alignment',
            metric: 'N/A',
        },
    ]

    const filteredKeyFactsHeadings = keyFactsHeadings.filter(heading => heading.metric || heading.startMetric)

    const keyFactsSubHeadings = [
        {
            text: 'Research Category',
            metric: grant.ResearchCat[0],
        },
        {
            text: 'Research Subcategory',
            metric: grant.ResearchSubcat[0],
        },
        {
            text: 'Special Interest Tags',
            metric: grant.Tags,
        },
        {
            text: 'Study Subject',
            metric: grant.StudyType[0],
        },
        {
            text: 'Clinical Trial Details',
            metric: grant.ClinicalTrial[0],
        },
        {
            text: 'Broad Policy Alignment',
            metric: 'Pending',
        },
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
        {
            text: 'Occupations of Interest',
            metric: grant.OccupationalGroups,
        },
    ]

    if (grant.Disease.includes('Mpox')) {
        keyFactsSubHeadings.push({
            text: 'Mpox Research Priorities',
            metric: grant.MPOXResearchPriority,
        })

        keyFactsSubHeadings.push({
            text: 'Mpox Research Sub Priorities',
            metric: grant.MPOXResearchSubPriority,
        })
    }

    return (
        <div className="my-2 breakout-with-border overflow-hidden">
            <div className="relative flex flex-col lg:flex-row justify-start items-center w-full bg-secondary md:rounded-2xl overflow-hidden">
                <h2 className="self-start lg:self-auto px-4 py-2 lg:py-0 lg:px-4 text-white tracking-wider lg:[writing-mode:vertical-lr] uppercase text-lg lg:text-xl font-medium">Key facts</h2>
                <div className="w-full bg-primary text-secondary">
                    <ul className="grid grid-cols-2 md:grid-cols-6 bg-gradient-to-t from-secondary/20 to-transparent to-50% border-b-2 border-secondary/30">
                        {filteredKeyFactsHeadings.map((heading, index) => {
                            const borderClasses = [
                                index === 0 && 'col-span-2 md:col-span-3 md:border-r-2 border-b-2',
                                index === 1 &&  `border-r-2 md:col-span-3 md:border-r-0 border-b-2`,
                                index === 2 && 'md:border-r-2 md:col-span-2 border-b-2',
                                index === 3 && 'border-r-2 md:col-span-2 md:border-r-2 border-b-2',
                                index === 4 && 'md:col-span-2 border-b-2',
                                index === 5 && 'col-span-1 max-md:border-b-2 md:col-span-2 border-r-2',
                                index === 6 && 'col-span-1 max-md:border-b-2 md:col-span-2 md:border-r-2',
                                index === 7 && 'col-span-2',
                            ].filter(Boolean).join(' ')

                            const metricClasses = [index > 2 ? 'text-lg lg:text-xl' : 'text-lg md:text-3xl lg:text-4xl font-bold'].join(' ')

                            const metricIsArray = Array.isArray(heading?.metric)
                            const filteredMetric = metricIsArray ? heading.metric.filter((m: any) => m) : heading.metric
                            const metric = metricIsArray ? filteredMetric.slice(0, 2).join(', ') : heading?.metric
                            const infoModalMetric = metricIsArray && filteredMetric.length > 3 ? heading.metric.join(', ') : ''

                            let headingText = ''

                            if (heading.text === 'Start & end year' && heading.endMetric < 0) {
                                headingText = 'start year'
                            } else {
                                headingText = heading.text
                            }

                            return (
                                <li key={index} className={`${borderClasses} p-4 py-5 flex flex-col justify-between space-y-2 border-secondary/10`}>
                                    <div className="flex items-center space-x-2">
                                        <p className="uppercase text-xs tracking-widest font-bold">{headingText}</p>
                                    </div>

                                    {heading.startMetric ? (
                                        <div className="flex gap-1 items-center ">
                                            <span className={metricClasses}>{heading.startMetric}</span>
                                            {heading.endMetric && heading.endMetric > 0 && (
                                                <div className="flex gap-1 items-end h-full">
                                                    <div className="flex items-center gap-1">
                                                        <ArrowRightIcon className="w-4 h-4 md:h-5 md:w-5 opacity-50" />
                                                        <span className="text-md md:text-xl lg:text-2xl font-bold">{heading.endMetric}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {metric ? (
                                                <div className={`${metricClasses} font-bold`}>
                                                    <div>
                                                        <span>{metric}</span>
                                                        {infoModalMetric && (
                                                            <div className="inline">
                                                                <span className="pl-1">…</span>
                                                                <InfoModal
                                                                    customButton={
                                                                        <span className="bg-secondary inline-block whitespace-nowrap text-white rounded-full ml-1 px-2 py-0.5 lg:-translate-y-1 text-sm">
                                                                            {heading ? heading.metric.length - 2 : ''} more
                                                                        </span>
                                                                    }
                                                                >
                                                                    <p>{infoModalMetric}</p>
                                                                </InfoModal>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={`${metricClasses} font-bold`}>N/A</p>
                                            )}
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                    <ul className="grid grid-cols-2 md:grid-cols-3 bg-primary-lightest">
                        {keyFactsSubHeadings.map((subHeading, index) => {
                            const borderClasses = [
                                'col-span-2 md:col-span-1 border-b-2',
                                (index === 6 || index === 7 || index === 8) && 'md:border-b-0',
                                (index === 0 || index === 1 || index === 3 || index === 4 || index === 6 || index === 7) && 'md:border-r-2',
                              ].filter(Boolean).join(' ');
                              
                            return (
                                <li key={index} className={`${borderClasses} p-4 py-5 flex flex-col justify-between space-y-2 border-secondary/10`}>
                                    {subHeading.infoModalText ? (
                                        <div className="flex items-center space-x-2">
                                            {subHeading.text && <p className="uppercase text-xs tracking-widest font-bold">{subHeading.text}</p>}
                                            <InfoModal>
                                                <p>{subHeading.infoModalText}</p>
                                            </InfoModal>
                                        </div>
                                    ) : (
                                        <>{subHeading.text && <p className="uppercase text-xs tracking-widest font-bold">{subHeading.text}</p>}</>
                                    )}

                                    <p className="font-bold text-lg lg:text-xl">{subHeading.metric?.length > 0 ? subHeading.metric : 'N/A'}</p>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
