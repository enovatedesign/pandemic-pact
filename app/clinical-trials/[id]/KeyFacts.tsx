import KeyFacts, { clean, type Fact } from '@/app/components/KeyFacts'

export default function ClinicalTrialKeyFacts({ trial }: { trial: any }) {
    const headings: Fact[] = [
        { text: 'Disease', metric: clean(trial.Diseases) },
        { text: 'Registration Year', metric: clean(trial.RegistrationYear) },
        { text: 'Enrolment Year', metric: clean(trial.EnrolmentStartYear) },
        { text: 'Phase', metric: clean(trial.Phase) },
        { text: 'Recruitment Status', metric: clean(trial.RecruitmentStatus) },
        { text: 'Research Location', metric: clean(trial.ResearchLocationCountryName) },
        { text: 'Lead Research Institution', metric: clean(trial.ResearchInstitutionName) },
        { text: 'Intervention', metric: clean(trial.Interventions) },
        { text: 'Outcome', metric: clean(trial.Outcomes) },
    ].filter(heading => heading.metric)

    const subHeadings: Fact[] = [
        { text: 'URL to Results', metric: clean(trial.ResultsLink), isUrl: true },
        { text: 'Sample Size', metric: clean(trial.SampleSize) },
        { text: 'Ethics', metric: clean(trial.EthicsStatus) },
        { text: 'Gender', metric: clean(trial.Gender) },
        {
            text: 'Age Group',
            metric: clean(trial.AgeGroups),
            infoModalText:
                'We curated data on the age groups using information from the trial registration when available. If no age criteria were specified, we coded the field as unspecified.',
        },
        {
            text: 'Vulnerable Population',
            metric: clean(trial.VulnerablePopulations),
            infoModalText:
                'We curated data on the vulnerable populations using information on special populations from the trial registration. If a trial involved participants with recognised vulnerabilities, we used this information to populate the field. If no vulnerabilities were mentioned, we coded the field as unspecified. If the trial was conducted on non-human populations, including viruses or other, we coded the field as not applicable.',
        },
        { text: 'Occupations of Interest', metric: clean(trial.OccupationalGroups) },
    ].filter(subHeading => subHeading.metric)

    return <KeyFacts headings={headings} subHeadings={subHeadings} />
}
