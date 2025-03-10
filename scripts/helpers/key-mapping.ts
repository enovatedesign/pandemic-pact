import { uniq } from "lodash"

// Note that some of the columns in the source spreadsheets are not included
// here because we don't need them.

// Initial data used was formatted as the values of this object
// keyMapping converts the new data keys to the existing data keys to functionality

// If the fields are required for the visualisation page grant files, 
// ensure to add the value (eg: 'GlobalMpoxResearchSubPriorities') to prepare-visualise-page-grants-files
export const keyMapping: { [key: string]: string } = {
    pactid: 'GrantID',
    grant_number: 'PubMedGrantId',
    grant_title_eng: 'GrantTitleEng',
    award_amount_converted: 'GrantAmountConverted',
    abstract: 'Abstract',
    grant_start_year: 'GrantStartYear',
    grant_end_year: 'GrantEndYear',
    publication_year_of_award: 'PublicationYearOfAward',
    study_subject: 'StudySubject',
    ethnicity: 'Ethnicity',
    age_groups: 'AgeGroups',
    rurality: 'Rurality',
    vulnerable_population: 'VulnerablePopulations',
    occupational_groups: 'OccupationalGroups',
    study_type_main: 'StudyType',
    clinical_trial: 'ClinicalTrial',
    families: 'Families',
    pathogen: 'Pathogen',
    disease: 'Disease',
    funder_name: 'FundingOrgName',
    funder_country: 'FunderCountry',
    funder_region: 'FunderRegion',
    research_institition_name: 'ResearchInstitutionName',
    research_institution_region: 'ResearchInstitutionRegion',
    research_institution_country_iso: 'ResearchInstitutionCountry',
    research_location_region: 'ResearchLocationRegion',
    research_location_country_iso: 'ResearchLocationCountry',
    main_research_priority_area_number_new: 'ResearchCat',
    main_research_sub_priority_number_new: 'ResearchSubcat',
    mpox_research_priority: 'GlobalMpoxResearchPriorities',
    priority_statements_regional: 'GlobalMpoxResearchSubPriorities',
    priority_statements_who_immediate_parent: 'WHOMpoxResearchPriorities',
    priority_statements_who_immediate: 'WHOMpoxResearchSubPriorities',
    marburg_parent: 'MarburgCORCResearchPriorities',
    marburg_corc_priorities: 'MarburgCORCResearchSubPriorities',
    influenza_a: 'InfluenzaA',
    influenza_h1: 'InfluenzaH1',
    influenza_h2: 'InfluenzaH2',
    influenza_h3: 'InfluenzaH3',
    influenza_h5: 'InfluenzaH5',
    influenza_h6: 'InfluenzaH6',
    influenza_h7: 'InfluenzaH7',
    influenza_h10: 'InfluenzaH10',
    tags: 'Tags',
}

export const mpoxResearchPriorityAndSubPriorityMapping: {
    [key: string]: string
} = {
    // '12': 'capacity_strengthening_list', // To be confirmed
    // '13': 'disease_surveillance_list', // To be confirmed

    '14': 'pathogen_natural_history_transmission_and_diagnostics_list', // Grants By Mpox Research  Priority sub category
    '15': 'animal_and_environmental_research_and_research_on_diseases_vectors_list', // Grants By Mpox Research  Priority sub category
    '16': 'epidemiological_studies_list', // Grants By Mpox Research  Priority sub category
    '17': 'clinical_characterisation_and_management_list', // Grants By Mpox Research  Priority sub category
    '18': 'infection_prevention_and_control_list', // Grants By Mpox Research  Priority sub category
    '19': 'therapeutics_research_development_and_implementation_list', // Grants By Mpox Research  Priority sub category
    '20': 'vaccines_research_development_and_implementation_list', // Grants By Mpox Research  Priority sub category
    '21': 'policies_for_public_health_disease_control_community_resilience_list', // Grants By Mpox Research  Priority sub category
    '22': 'secondary_impacts_of_disease_response_control_measures_list', // Grants By Mpox Research  Priority sub category
    '23': 'health_systems_research_list', // Grants By Mpox Research  Priority sub category

    '24': 'priority_statements_regional', // Grants By Mpox Research Priority Category
}

export function convertSourceKeysToOurKeys(originalObject: {
    [key: string]: any
}) {
    const convertedObject: { [key: string]: any } = {}

    for (const [key, value] of Object.entries(originalObject)) {
            
        if (keyMapping[key] === undefined) {
            continue
        }

        convertedObject[keyMapping[key]] = value
    }

    return convertedObject
}

// It has been requested that the Marburg Roadmap options include a description 
// to be displayed with the title. Below is a list of descriptions provided 
// which are accessed via the value of the select option within marburg_corc_priorities (MarburgCORCResearchSubPriorities)
export const marbugCorcPriorityDescriptions = {
    '1': 'As opposed to Ebola virus disease, outbreaks of Marburg virus disease are typically initiated by direct zoonotic spillover from bats to humans. The Egyptian rousette bat – ERB- (Rousettus aegyptiacus) has been identified to be a reservoir of MARV and humans can be infected through contact with excretions or secretions of infected bats. Data obtained from roost and forage site maps can help focus and enhance MARV surveillance activities in so called “hot Zones” and is critical to reduce potential exposure and to better predict and prevent emergence of human outbreaks. Monitoring of human activities that put individuals at risk is important. Of these, human activities in caves where MARVinfected bats dwell such as mining and tourism are of special importance. As the scientific evidence also points out to possible transmission of filoviruses through sexual activities, this may also include risk factors for sexual transmission of filoviruses and in this particular case MARV.',
    '2': 'Outbreak responses should be based on epidemiologic investigation and diagnostics. There are several diagnostic approaches for filoviruses beyond EBOV already in use in DRC and other African countries. They include Biofire (blood samples and naso-oral pharyngeal swabs), QS7 systems, and common sequencing platforms (NGS) using Illumina and Nanopore for metagenomics, shotgun metagenomics or capture on probes for sequencing (Panviral or customized), multiplex serology platform by Luminex (IgM or IgG detection. Horizontal (south to south) collaborations are the best way forward to expand diagnostic capacity not only for outbreak response, but also for active and passive surveillance.',
    '3': 'Countries at-risk of filovirus diseases should enhance routine surveillance in areas where previous outbreaks were detected and/or in areas with ecology suggestive of potential spillover (cf. priority 1). Studies to better understand risk factors for transmission and dynamics of disease transmission are needed. Using IDSR case definition, countries should ensure ability to early detect cases at health facilities (strengthening clinical suspicion) or through mortality surveillance, with trained workforce able to safely collect adequate samples and to timely perform RT-PCR at a designated reference laboratory or consider additional diagnostic methods7. Thorough case investigation, including epidemiological, clinical and laboratory data, would also be required. This requires sustained efforts in training and supporting health workforce in all at risk countries. Through existing filovirus survivor care programmes, attention should also be paid to health and well-being of survivors and their families to early detect any potential transmission or relapse linked with viral persistence. MARV outbreaks have recently been reported during recent years in areas not previously affected (e. g Guinea, Ghana, Equatorial Guinea and Rwanda). Laboratory networks with capacity to do active and passive surveillance of filovirus disease have expanded greatly in sub-Saharan Africa since the 2013-2016 Ebola virus disease outbreak in West Africa. Such laboratories are both national and international and have capacity to contribute to disease surveillance in humans (e. g. seroprevalence studies) and wildlife surveillance (e. g. carcass surveillance, reservoir surveillance). However, there is currently no connection and share of knowledge between laboratories located in different filovirus endemic countries which prevents a global understanding of the prevalence of filovirus diseases. Online data repositories may help to increase this knowledge and predict future outbreak hotspots.',
    '4': 'Operational research aimed to define early biomarkers of disease outcome, pathogenesis determinants, and novel therapeutic targets is important. Such research provides a unique opportunity to develop toolkits to inform clinicians, to discover genetic or immunological factors that protect some individuals from disease, and to identify mechanisms that explain the differences in pathogenesis observed across filoviruses. Better understanding of such mechanisms would increase the potential that these could be used for therapeutic development. The clinical burden of an outbreak can challenge our ability to conduct vital research which is needed to develop and improve human countermeasures (drugs, therapeutics and vaccines). We therefore need to plan to ensure that we integrate research as part of the WHO CORE trial protocols to define early biomarkers of disease outcome, pathogenesis determinants, the inability or ability of viruses to mutate around countermeasures, novel therapeutic targets, and correlates of protection from vaccines. It is also important to expand understanding of less studied viruses by applying knowledge from the more thoroughly studied viruses.',
    '5': 'Animal model research, in particular research in non-human primate models, has been key to understand the natural history of filovirus infection and to develop vaccines and therapeutics. Indeed, the efficacy of candidate vaccines and therapeutics challenge studies in NHP are highly predictive of the efficacy in humans. Refined models including alternatives to whole-animal model systems, are needed as surrogate models to test the pathogenicity of newly discovered filoviruses in humans, to underscore mechanisms of infection, to develop new therapies and to test future cross-protective vaccines. Surrogate systems are also needed for use at lower biocontainment levels. Standardized assays to evaluate humoral and cellular immunity against natural infection and vaccination are also needed.',
    '6': 'Development of MCMs that can safely and effectively prevent and treat multiple filoviruses is the ultimate goal. Efforts to accelerate the development and evaluation of MARV MCMs in clinical trials needed to advance them towards regulatory approval are critical. Four candidate vaccines have been evaluated by the WHO prioritization committee, all considered suitable for inclusion in trials. Regarding treatment, a monoclonal antibody and an antiviral are recommended by the prioritization committee for clinical trial core protocol including combination therapy. The importance of phase II/III studies to evaluate the clinical efficacy and safety of candidate MCMs during MARV epidemics should be underlined. Candidate vaccines under development includes GP and vectored vaccines (replicating and non-replicating). Determining the durability of vaccineinduced immunity is also needed. Another key issue is assessing the breadth of protection. In the absence of phase 3 clinical data for candidate vaccines, it is important to identify the correlates of protective immunity of filovirus vaccines to include the levels of specific immune responses required for protection in humans, especially for MARV.  Candidate treatments include antibodies, small molecules, mixed (need to be given early, usually within 5 days, a bit later with combination). All filoviruses have similar life-cycle, which can promote antiviral via proviral and antiviral host factors. Differences in biology/virulence determinants can lead to different infection outcomes. The identification of additional critical host factors as targets of small molecule inhibitors could also better inform the development of broad-spectrum strategies for therapeutic development. There is a need to foster the development of therapeutics for post-exposure therapy, with a special interest on strategies that may work across all filoviruses (pan-filovirus therapy).',
    '7': 'Despite the above, standardization of optimal supportive clinical care and training across all filoviruses endemic countries is imperative, as emerging evidence clearly indicates the positive impact on patient survival and on management of complications. Studies leading to better understanding of predominant clinical features, their prognostic value, and the respective rates of organ dysfunction, viral load, serologic response, immune response, and typical timing. This will lead to more precise knowledge of the natural history will allow more responsive clinical protocols to be developed, and triage by disease severity. Characterizing and quantifying the rates and impact of long-term medical problems in survivors, including viral persistence to facilitate screening and treatment for important complications may prevent morbidity, but needs to be focused to be feasible. Identifying innovative ways to rapidly update and implement optimized supportive care protocols and measure impact (i.e. trainings, ultrasound, wireless monitoring, behaviour change, renal replacement therapy, transfusion therapy, etc. Optimized supportive care protocol appears to reduce mortality when embedded into clinical trials, but its implementation is variable and dependent on early diagnosis, referral pathways, and treatment centre resources. Understanding MARV presence in the environment pre and post cleaning and disinfection, on personal protective equipment before and after clinical procedures. This will generate more precise information to inform risk assessment for IPC interventions. Developing and validating Filovirus key performance indicators to inform quality improvement during outbreak responses and through the emergency cycle. Mortality early in outbreaks is frequently elevated as care and treatment centres are established, using KPI can help to focus interventions to improve quality quickly.',
    '8': 'For each outbreak, the aim is to do even better in initiating early clinical trials to collect key data on efficacy and safety. Continued evaluation of candidates MCMs is crucial using panfilovirus CORE protocols for generating evidence on their safety and clinical efficacy is critical.  Due to the sporadic nature of MARV outbreaks, this includes use of panfilovirus CORE protocols for clinical trials designed in advance and benefiting from inputs from researchers from 17 at risk countries. The CORE Protocol - A phase 1/2/3 study to evaluate the safety, tolerability, immunogenicity, and efficacy of vaccine candidates against (Filoviruses) virus disease in healthy individuals at risk of (Filovirus) virus disease allows clinical trials to be conducted quickly and efficiently during the event of an outbreak. The protocol is flexible, meets vaccines where they are, considers outbreak and inter-outbreak phases. During outbreak a ring vaccination trial of delayed vs immediate vaccination will generate evidence on clinical efficacy. The Solidarity Partners – Platform adaptive randomized trial for new and repurposed Filovirus treatments– Core Trial Protocol for candidate therapeutics has factorial design that can randomize separately to monoclonal, antiviral, and host directed therapies with a primary outcome on all-cause mortality at 28 days. No host directed therapy component for MARV. This was successfully implemented in Rwanda with strong support, but some challenges e.g., supply chain/logistics, clinical load for physicians,transition from off-label/expanded access, and use of verified lab methods for 2ndary outcomes.',
    '9': 'Promote that knowledge outputs and methodological limitations are easily understood by non-social scientists. Develop and employ strong methodologies and theoretical frameworks to tackle current epidemic challenges. Implement societal measures such as Good Participatory Practices to work with communities to enhance acceptance of clinical trials for testing of candidate vaccines and therapeutics. Research priorities include in-depth studies on sociocultural, economic, and behavioral determinants of health, integrating social science methods with epidemiological research to build trust and inform community-centered Filoviruses outbreak responses. There is a need to engage community stakeholders early in co-designing participatory tools, fostering trust through ongoing feedback mechanisms, and addressing barriers like fear and misinformation to ensure acceptance and uptake of vaccines and therapeutics through culturally relevant and ethical practices. Efforts should be encouraged to simplify and disseminate research findings in actionable formats while institutionalizing Good Participatory Practices (GPP) to enhance transparency, accountability, and trust, and ensuring community-centered approaches to vaccine and therapeutic trials.',
    '10': 'Contribute to enhance collaboration through a ‘Network of Networks’ approach. The Interim Medical Countermeasures Network (i-MCM-Net) vision is to provide timely and equitable access to quality, safe, effective and affordable MCMs in response to public health emergencies by building on existing networks and fostering global collaboration. Continued development and improvement of the infrastructure required for conducting clinical trials in the countries at risk of outbreaks, as well as establishing and improving partnerships with Ministers of Health, local research institutions and other stakeholders. Leadership of studies launched by local scientist should be a continuous goal.'
}

// Map outbreak diseases to their corresponding pathogen family label
// Using this label we can find the correct value from selectOptions[Pathogen]
export const outbreakDiseaseToPathogenFamilyMapping = {
    "Ebola virus disease": "Filoviridae"
}

export const formatRawKeyToOurKey = (key: string) => {
    return key.split('_').map(text => 
        text.charAt(0).toLocaleUpperCase() + text.slice(1)
    ).join('')
}

export const prepareSpecificSelectOptions = (rawOptions: any, target: string) => {

    const optionsWithConvertedKeys = Object.keys(rawOptions)
        .filter(( rawKey: string ) => rawKey.includes(target))
        .map(rawKey => {
            const rawValues = rawOptions[rawKey as keyof typeof rawOptions]
            const convertedKey = formatRawKeyToOurKey(rawKey)
            
            return {
                [convertedKey]: rawValues
            }
        })
        
    return optionsWithConvertedKeys
        .reduce((acc, entry) => {
            const [key, values] = Object.entries(entry)[0]
            acc[key as any] = values
            
            return acc
        }, {}
    )
}

export const convertRawGrantKeysAndReturnOriginalObject = (rawGrant: any, target: string, keyArrayToBuild?: string[]) => {
    return Object.keys(rawGrant)
        .filter(key => key.includes(target))
        .map(key => {
            // If the value is not checked, return
            if (rawGrant[key] !== '1') {
                return 
            }

            // Now we have the values on the grant that are checked
            // Split the key to get the disease strain and the value as separate indexes in an array
            const splitData = key.split('___')
            // Format the first index as the key eg: FiloviridaeDiseasesStrains
            const formattedKey = formatRawKeyToOurKey(splitData[0])
            // Some keys include 3x "_" and others include 4x "_"
            // As we have already split the key by 3x "_", the second index may in some cases contain a trailing underscore, if this is the case, it relates to -88, and -99 values
            // Replace the trailing underscore with "-"
            const formattedValue = splitData[1].replace('_', '-')
            
            // If an array is passed in, push the key to it
            if (keyArrayToBuild) {
                keyArrayToBuild.push(formattedKey)
            } 
            
            // Return the structured object
            return {
                [formattedKey]: formattedValue
            }
        })
        .reduce((acc, obj) => ({ ...acc, ...obj }), {}) // Flatten the array of objects to allow object destructuring in the return statement
}