import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

export default function GrantsPerMpoxResearchPriority() {
    const subtitle = (
        <>
            Research priorities as outlined in the{' '}
            <a
                href="https://africacdc.org/news-item/communique-united-in-the-fight-against-mpox-in-africa-high-level-emergency-regional-meeting/"
                className="text-auto"
            >
                African Ministers of Health communique
            </a>.
        </>
    )

    return (
        <VisualisationCard
            id="combined-regional-mpox-priorities"
            title="Grants by Mpox Outbreak Specific Research Priorities"
            subtitle={subtitle}
        >
            <AllSubCategoriesBarList
                categoryField="GlobalMpoxResearchPriorities"
                subcategoryField="GlobalMpoxResearchSubPriorities"
            />
        </VisualisationCard>
    )
}
