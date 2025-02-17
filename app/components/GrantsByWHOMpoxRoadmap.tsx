import VisualisationCard from './VisualisationCard'
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

const GrantsByWHOMpoxRoadmap = () => {
    const subtitle = (
        <>
            Research priorities as outlined in a coordinated research roadmap - <a href="https://www.who.int/publications/m/item/a-coordinated-research-roadmap-on-monkeypox-virus--immediate-research-next-steps-to-contribute-to-control-the-outbreak" target="_blank" rel="noreferrer noopener">
                Mpox Virus: Immediate Research Next Steps to Contribute to Control the Outbreak
            </a>
        </>
    )
    
    return (
        <VisualisationCard
            id="grants-by-who-mpox-roadmap"
            title="Global Mpox Research Priorities"
            subtitle={subtitle}
        >
            <AllSubCategoriesBarList
                categoryField="WHOMpoxResearchPriorities"
                subcategoryField="WHOMpoxResearchSubPriorities"
                removeCategoryLabels
            />
        </VisualisationCard>
    )
}

export default GrantsByWHOMpoxRoadmap