import CategoryAndSubcategoryBarList from './CategoryAndSubcategoryBarList/CategoryAndSubcategoryBarList'
import VisualisationCard from './VisualisationCard'

export default function GrantsPerMpoxResearchPriority() {
    const subtitle = (
        <>
            Research priorities as outlined in the{' '}
            <a
                href="https://africacdc.org/news-item/communique-united-in-the-fight-against-mpox-in-africa-high-level-emergency-regional-meeting/"
                className="text-auto"
            >
                African Ministers of Health communique
            </a>{' '}
            and the{' '}
            <a href="https://www.who.int/publications/i/item/9789240092907">
                WHO’s strategic framework for enhancing prevention and control
                of mpox – 2024-2027
            </a>
            .
        </>
    )

    return (
        <VisualisationCard
            id="grants-by-mpox-research-priority"
            title="Grants by Mpox Outbreak Specific Research Priorities"
            subtitle={subtitle}
        >
            <CategoryAndSubcategoryBarList
                topOfCardId="mpox-research-priorities"
                categoryField="MPOXResearchPriority"
                subcategoryField="MPOXResearchSubPriority"
            />
        </VisualisationCard>
    )
}
