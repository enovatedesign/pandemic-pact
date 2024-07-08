import CategoryAndSubcategoryBarList from './CategoryAndSubcategoryBarList/CategoryAndSubcategoryBarList'
import VisualisationCard from './VisualisationCard'

export default function GrantsPerMpoxResearchPriority() {
    return (
        <VisualisationCard
            id="grants-by-mpox-research-priority"
            title="Grants by Mpox Research Priority"
        >
            <CategoryAndSubcategoryBarList
                cardId="mpox-research-priorities"
                categoryField="MPOXResearchPriority"
                subcategoryField="MPOXResearchSubPriority"
            />
        </VisualisationCard>
    )
}
