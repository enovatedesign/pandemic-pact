import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

const GrantsByWHOMpoxRoadmap = () => (
    <VisualisationCard
        id="grants-by-who-mpox-roadmap"
        title="Grants by WHO Mpox Roadmap"
    >
        <AllSubCategoriesBarList
            categoryField="WHOMpoxResearchPriorities"
            subcategoryField="WHOMpoxResearchSubPriorities"
            removeCategoryLabels
        />
    </VisualisationCard>
) 

export default GrantsByWHOMpoxRoadmap