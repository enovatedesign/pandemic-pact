import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

export default function GrantsPerMpoxResearchPriority() {
    const subtitle = (
        <>
            Research priorities as outlined in a coordinated research roadmap - <a href="https://www.who.int/publications/m/item/a-coordinated-research-roadmap-on-monkeypox-virus--immediate-research-next-steps-to-contribute-to-control-the-outbreak" target="_blank" rel="noreferrer noopener">
                Mpox virus: Immediate research next steps to contribute to control the outbreak
            </a>
            .
        </>
    )

    return (
        <VisualisationCard
            id="combined-regional-mpox-priorities"
            title="Global Mpox Research Priorities"
            subtitle={subtitle}
        >
            <AllSubCategoriesBarList
                categoryField="GlobalMpoxResearchPriorities"
                subcategoryField="GlobalMpoxResearchSubPriorities"
            />
        </VisualisationCard>
    )
}
