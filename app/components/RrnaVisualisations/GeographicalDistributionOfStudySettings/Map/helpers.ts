import { rrnaLocationType } from "@/app/helpers/types";
import { countBy, flatMap, groupBy } from "lodash"
import selectOptions from '@/data/dist/select-options.json'
import regionToCountryMapping from '@/data/source/region-to-country-mapping.json'

export const formatDistributionOfStudySettingsStatusBarContent = (
    studies: any[], 
    selectedFeatureProperties: any, 
    locationType: rrnaLocationType
) => {
    // Access the selected country from the selected feature properties
    // We need to use select options to find the corresponding label for regions
    const nameOptions = {
        'regions': selectOptions['ResearchInstitutionRegion']
            .find(option => 
                option.value === selectedFeatureProperties.id
        )?.label as string,
        'countries': selectedFeatureProperties['name'],
    }
    
    const name = nameOptions[locationType]
    
    const regionCountryCodes = (regionToCountryMapping as Record<string, string[]>)[selectedFeatureProperties.id] ?? []
    const relatedStudyOptions = {
        'regions': studies.filter(study =>
            Array.isArray(study['StudyCountry']) &&
            study['StudyCountry'].some((code: string) => regionCountryCodes.includes(code))
        ),
        'countries': studies.filter(study =>
            Array.isArray(study['StudyCountry']) && study['StudyCountry'].includes(selectedFeatureProperties.id)
        )
    }
    
    // Find the related articles based on the selected location. 
    // If the locationType is countries, we now filter by ISO_N3 code (selectedFeatureProperties.id)
    // If the location type is regions, we need to use the corresponding geojsonRegionKey which is grouped by regionToCountryMapping in the build step
    const relatedStudies = relatedStudyOptions[locationType]
    
    // Flatten studies by disease since Diseases is now an array
    const studiesByDisease = relatedStudies.flatMap(study => 
        study['Diseases']?.map((disease: string) => ({
            ...study,
            disease
        })) || []
    )
    
    const relatedDiseasesToSelectedLocation = Object.entries(groupBy(studiesByDisease, 'disease'))
        .map(([disease, relatedStudies]) => {
            // Extract the research domains from the Domains array
            const allResearchDomainsRelatedToDisease = flatMap(relatedStudies, study => study.Domains)

            // Count the number of times a research domain is included
            const researchDomainCount = countBy(allResearchDomainsRelatedToDisease)

            const formattedResearchDomainCounts = Object.entries(researchDomainCount).map(([ researchDomain, count]) => ({
                researchDomain, 
                count
            })).sort((a, b) => b['count'] - a['count'])

            return {
                disease,
                totalNumberOfStudiesRelatedToDisease: relatedStudies.length,
                diseaseSpecificResearchDomains: formattedResearchDomainCounts
            }
        })
        // Sort by count descending, then by label alphabetically
        .sort((a, b) => {
            if (b.totalNumberOfStudiesRelatedToDisease !== a.totalNumberOfStudiesRelatedToDisease) {
                return b.totalNumberOfStudiesRelatedToDisease - a.totalNumberOfStudiesRelatedToDisease;
            }
            // Use label for tie-breaker if available
            const aLabel = (selectOptions['Diseases']?.find(option => option.value === a.disease)?.label) || a.disease;
            const bLabel = (selectOptions['Diseases']?.find(option => option.value === b.disease)?.label) || b.disease;
            return aLabel.localeCompare(bLabel);
        })
    
    return {
        name, // Returning selected name
        totalRelatedArticles: relatedStudies.length, // Total number of related articles
        relatedDiseasesToSelectedLocation
    }
}