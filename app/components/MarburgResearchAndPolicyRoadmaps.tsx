import VisualisationCard from "./VisualisationCard"
import AllSubCategoriesBarList from './CategoryAndSubcategoryBarList/AllSubCategories'

const MarburgResearchAndPolicyRoadmaps = () => {
  const subTitle = (
    <>
      Research priorities outlined by Filoviridae Collaborative Open Research Consortium (CORC) <a href="https://cdn.who.int/media/docs/default-source/blue-print/marburg-response--building-research-readiness-for-a-future-filovirus-outbreak/meeting-outcomes-top-10-priorities-for-research-to-develop-marburg-medical-countermeasures.pdf?sfvrsn=d1ec535f_4" target="_blank" rel="noreferrer noopener">WHO - Filoviridae CORC Marburg Building research readiness for a future filovirus outbreak</a>
    </>
  )
  return (
    <VisualisationCard
        id="grants-by-marburg-research-priority"
        title="Grants By Marburg Outbreak Research Priorities" 
        subtitle={subTitle}  
    >
        <AllSubCategoriesBarList
            categoryField="MarburgCORCResearchPriorities"
            subcategoryField="MarburgCORCResearchSubPriorities"
            removeCategoryLabels
        />
    </VisualisationCard>
  )
}

export default MarburgResearchAndPolicyRoadmaps