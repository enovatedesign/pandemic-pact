import VisualisationCard from './VisualisationCard'
import PrioritiesAccordion from './EbolaResearchPriorities/PrioritiesAccordion'
import { Scope, scopeLabels } from './EbolaResearchPriorities/ScopePill'
import { ebolaScopeColours } from '../helpers/colours'

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

    const footnote = 'We reviewed the 10 broad research priorities developed for the ongoing BVD outbreak by the Filovirus CORC and disaggregated each into simplified focus areas to facilitate mapping to research evidence. Mapping to some priority areas considered the full scope of Ebola research activities (where evidence from other ebolaviruses would be pertinent) whereas others focussed specifically on activities explicitly stating research involved BVD in alignment with the CORC’s framing for BVD research priorities. Priority areas are colour-coded by scope (BVD-specific research or all Ebola virus research). Note: Some awards may map to more than one priority area. Therefore, totals may exceed the actual counts.'

    return (
        <VisualisationCard
            id="grants-by-ebola-research-priority"
            title="Global Ebola Bundibugyo Research Priorities"
            subtitle={subTitle}
            footnote={footnote}
        >
            <div className="w-full space-y-4">
                <ScopeLegend />

                <PrioritiesAccordion />
            </div>
        </VisualisationCard>
    )
}

export default EbolaResearchPrioritiesCard
