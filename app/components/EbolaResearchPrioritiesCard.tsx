import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'
import selectOptions from '../../data/dist/select-options.json'
import { ebolaScopeColours } from '../helpers/colours'

type Scope = keyof typeof ebolaScopeColours

const scopeLabels: { [scope in Scope]: string } = {
    bvd: 'BVD research',
    all: 'All Ebola Research',
}

const subPriorityScopes: { [value: string]: Scope } = Object.fromEntries(
    (selectOptions.EbolaResearchSubPriorities as { value: string, scope: Scope }[])
        .map(({ value, scope }) => [value, scope]),
)

const ScopePill = ({ scope }: { scope: Scope }) => (
    <span
        className="inline-block mr-2 px-2 rounded-full border text-xs text-gray-900 whitespace-nowrap"
        style={{ borderColor: ebolaScopeColours[scope], backgroundColor: `${ebolaScopeColours[scope]}1A` }}
    >
        {scopeLabels[scope]}
    </span>
)

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
            <div className="space-y-4">
                <ScopeLegend />

                <AllSubCategoriesBarList
                    categoryField="EbolaResearchPriorities"
                    subcategoryField="EbolaResearchSubPriorities"
                    numberCategoryLabels
                    renderLabelPrefix={datum => {
                        const scope = subPriorityScopes[datum['Category Value']]

                        return scope && <ScopePill scope={scope} />
                    }}
                />
            </div>
        </VisualisationCard>
    )
}

export default EbolaResearchPrioritiesCard
