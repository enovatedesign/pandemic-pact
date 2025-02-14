import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

export default function GrantsPerMpoxResearchPriority() {
    const subtitle = (
        <>
            Research priorities as outlined in a <a href="https://www.who.int/publications/m/item/a-coordinated-research-roadmap-on-monkeypox-virus--immediate-research-next-steps-to-contribute-to-control-the-outbreak" target="_blank" rel="noreferrer noopener">coordinated research roadmap - Mpox Virus: Immediate Research Next Steps to Contribute to Control the Outbreak</a>
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
