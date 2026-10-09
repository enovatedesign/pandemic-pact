import VisualisationCard from './VisualisationCard'
import PrioritiesAccordion from './EbolaResearchPriorities/PrioritiesAccordion'
import { Scope, scopeLabels } from './EbolaResearchPriorities/ScopePill'
import { ebolaScopeColours } from '../helpers/colours'
import InfoModal from './InfoModal'
import LogoInverted from './LogoInverted'

const ScopeLegend = () => (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        {(Object.keys(scopeLabels) as Scope[]).map(scope => (
            <li key={scope} className="flex items-center gap-x-2">
                <span className="size-3 rounded-sm" style={{ backgroundColor: ebolaScopeColours[scope] }} />
                {scopeLabels[scope]}
            </li>
        ))}
    </ul>
)

const EbolaResearchPrioritiesCard = () => {
    const subTitle = (
        <>
            10 Research priorities for the ongoing BVD outbreak as outlined in <a
                href="https://iris.who.int/server/api/core/bitstreams/2ca5ef8f-d3cf-408b-8838-744dd6baeaf0/content"
                target="_blank"
                rel="noreferrer noopener"
            >
                Filovirus Collaborative Open Research Consortium research priorities for the ongoing Bundibugyo virus disease outbreak
            </a> report
        </>
    )

    const footnote = 'We reviewed the 10 broad research priorities developed for the ongoing BVD outbreak by the Filovirus CORC and disaggregated each into simplified focus areas to facilitate mapping to research evidence. Mapping to some priority areas considered the full scope of Ebola research activities (where evidence from other ebolaviruses would be pertinent) whereas others focussed specifically on activities explicitly stating research involved BVD in alignment with the CORC’s framing for BVD research priorities. Priority areas are colour-coded by scope (BVD-specific research or all Ebola virus research). To view BVD awards mapped to the priorities, select Filter by BVD Research Only in the left panel. Note: Some awards may map to more than one priority area. Therefore, totals may exceed the actual counts.'

    const methodology = [
        'Research funding awards were mapped to the Ebola Bundibugyo virus disease (BVD) research priorities in collaboration with the Filoviridae Collaborative Open Research Consortium (CORC). Each priority area was reviewed and disaggregated into discrete sub-areas to ensure comprehensive coverage of its defined scope. Each sub-area was subsequently mapped to one or more corresponding Pandemic PACT research categories, resulting in a data extraction framework which was validated by the Filoviridae CORC.',
        'Eligible grants were identified through automated screening using Python-based methods, followed by manual verification to ensure accuracy of inclusion and classification.',
        'Grants were first classified at the sub-area level and then aggregated to the corresponding main priority area. Because individual grants may be assigned to multiple sub-areas but are counted once within the main priority area, the sum of grants across sub-areas may exceed the main priority area total. Additionally, grants relevant to more than one main priority area are counted under each, so cumulative totals across priority areas may exceed the total number of unique grants.',
    ]

    return (
        <VisualisationCard
            id="grants-by-ebola-research-priority"
            title="Global Ebola Bundibugyo Research Priorities"
            subtitle={subTitle}
            logos={
                <>
                    <LogoInverted className="h-10 w-auto" aria-label="Pandemic PACT" role="img" />
                    <img src="/images/anrs-logo.png" alt="ANRS Emerging Infectious Diseases" className="h-10 w-auto" />
                </>
            }
            footnote={
                <>
                    {footnote}{' '}
                    <span className="ignore-in-image-export">
                        <InfoModal customButton={<span className="text-secondary underline">Read our full methodology</span>}>
                            <h3>Methodology</h3>

                            {methodology.map(paragraph => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </InfoModal>.
                    </span>
                </>
            }
        >
            <div className="w-full space-y-4">
                <ScopeLegend />

                <PrioritiesAccordion />
            </div>
        </VisualisationCard>
    )
}

export default EbolaResearchPrioritiesCard
