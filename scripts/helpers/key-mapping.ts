import { RawGrant } from "../types/generate"
import { resolveCanonicalCode } from "./redcap-codes"

// Note that some of the columns in the source spreadsheets are not included
// here because we don't need them.

// Initial data used was formatted as the values of this object
// keyMapping converts the new data keys to the existing data keys to functionality

// If the fields are required for the visualisation page grant files, 
// ensure to add the value (eg: 'GlobalMpoxResearchSubPriorities') to prepare-visualise-page-grants-files
export const keyMapping: { [key: string]: string } = {
    pactid: 'GrantID',
    grant_number: 'PubMedGrantId',
    grant_title_original: 'GrantTitleOriginal',
    grant_title_eng: 'GrantTitleEng',
    abstract_original: 'AbstractOriginal',
    abstract: 'Abstract',
    award_amount_converted: 'GrantAmountConverted',
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

    // Diagnostics research carries no clinical trial phase, so the clinical
    // research visualisations place it on their axis by D1 development stage
    // instead. Names match the clinical-trials (ICTRP) mapping so the two
    // datasets stay symmetrical.
    diagnostics_categorisation: 'DiagnosticsCategorisation',
    diagnostics_theme_category: 'DiagnosticsThemeCategory', // ___d1 .. ___d4
    diagnostics_d1_sub: 'DiagnosticsD1Sub', // ___a .. ___g
    families: 'Families',
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
    ebola_priorities: 'EbolaResearchPriorities',
    ebola_priority_simplified: 'EbolaResearchSubPriorities',
    influenza_a: 'InfluenzaA',
    influenza_h1: 'InfluenzaH1',
    influenza_h2: 'InfluenzaH2',
    influenza_h3: 'InfluenzaH3',
    influenza_h5: 'InfluenzaH5',
    influenza_h6: 'InfluenzaH6',
    influenza_h7: 'InfluenzaH7',
    influenza_h10: 'InfluenzaH10',
    tags: 'Tags',
    hundred_dm_flag: 'HundredDaysMissionFlag',
    'onehundreddm_research_area': 'HundredDaysMissionResearchArea',
    'onehundreddm_implementation': 'HundredDaysMissionImplementation',
    research_location_country: 'PolicyRoadmapResearchLocationCountry',
    capacity_strengthening_list: 'HundredDaysMissionCapacityStrengthening',
    pandint_themes: 'PandemicIntelligenceThemes',
    outbreak_id: 'OutbreakIds'
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

export function convertSourceKeysToOurKeys(
    originalObject: { [key: string]: any },
    retainOriginalKeys: boolean = false
) {
    return convertKeysUsingMapping(originalObject, keyMapping, retainOriginalKeys)
}

/**
 * Generic version of convertSourceKeysToOurKeys that takes an explicit mapping,
 * so datasets other than grants (e.g. clinical-trials) can reuse the same
 * rename-and-drop behaviour with their own column -> field mapping.
 */
export function convertKeysUsingMapping(
    originalObject: { [key: string]: any },
    mapping: { [key: string]: string },
    retainOriginalKeys: boolean = false
) {
    const convertedObject: { [key: string]: any } = {}

    for (const [key, value] of Object.entries(originalObject)) {
        const mappedKey = mapping[key]

        if (mappedKey) {
            convertedObject[mappedKey] = value
        } else if (retainOriginalKeys) {
            convertedObject[key] = value
        }
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

// Shown in the info icon beside each broad priority heading, one entry per paragraph.
// Wording from the "Priorities" sheet of CORC's Ebola mapping workbook (the dictionary has
// no detail text); paragraph breaks follow the published CORC report.
export const ebolaPriorityDescriptions: { [priority: string]: string[] } = {
    '1': [
        'Research should characterize clinical presentations, determinants of disease progression, severe outcomes and mortality, while improving understanding of the biological mechanisms underlying acute infection. Studies should investigate host immune responses and immunopathological pathways associated with disease severity, identify biomarkers of prognosis and clinical outcomes and assess the role of coinfections, host factors and pre-existing or cross-reactive immunity in shaping disease trajectories. Experimental animal models should complement human studies by generating data on pathogenesis and mechanisms of severe disease that cannot easily be obtained in outbreak settings.',
        'In parallel, research should characterize transmission chains, contact networks, the burden of asymptomatic or minimally symptomatic infections, and the epidemiological parameters needed for predictive modelling and operational planning. Population movement, cross-border exchanges, health care-associated transmission and social interactions may all influence outbreak dynamics and should be better documented through integrated clinical, epidemiological, laboratory, and social science approaches.',
    ],
    '2': [
        'Social and behavioural research produces scientific evidence that helps public health responders understand and stop community transmission and implement lifesaving public health interventions. Rapid, iterative social and behavioural research should be conducted throughout the outbreak to identify emerging community concerns and priorities, enabling continuous adaptation of community engagement and risk communication strategies. Longitudinal research should also examine how stigma, social cohesion, community resilience and socioeconomic impacts evolve beyond the acute outbreak phase.',
        'The success of outbreak response depends on community trust and the acceptability of public health measures. In the context of insecurity, population displacement and recurrence of Ebola disease and other emergencies, social and behavioural dimensions strongly influence case detection, contact tracing and adherence to recommended infection prevention measures and care. Particular attention should be given to high-risk community settings, including cross-border markets, religious gatherings, funerals and other mass gatherings where culturally appropriate engagement and communication strategies are essential. In addition, funeral practices and the cultural meanings attached to death are particularly sensitive issues and tensions surrounding safe and dignified burials have repeatedly fueled suspicion and transmission during previous outbreaks.',
        'Risk communication and community engagement aim to build trust and community support but must be informed by social and behavioural research into the specific dynamics and priorities facing populations during the outbreak, including stigma and misinformation, which may vary between groups, across locations and over time. Findings of such research must feed back into the reshaping of the wider response, including clinical care, family engagement and safe and dignified burials, as well as addressing rumors transparently. This will strengthen trust and local ownership of the response.',
        'Social and behavioural research is also needed to optimize community engagement, inform the design and implementation of clinical trials, and better understand the experience of frontline teams delivering research during outbreaks. Engagement is strongest when research is clearly connected to improved patient care and access to treatment, particularly when studies are embedded within the routine health care delivery of health care. Patients and communities are more willing to participate when they perceive a direct benefit for those affected by the disease.',
    ],
    '3': [
        'The current outbreak offers a unique opportunity to evaluate diagnostic tools under real-world field conditions. Research is needed to develop and evaluate innovative diagnostic tools and sampling approaches that facilitate safe, rapid and close to patient testing, while supporting the development and validation of BDBV-specific as well as pan-filovirus diagnostic tests. This may include rapid molecular and antigen-based assays, as well as minimally invasive strategies such as saliva-based diagnostics, self sampling devices and skin-patch technologies.',
        'Studies should also optimize genomic surveillance and explore the integration of diagnostic, sequencing and epidemiological data to better characterize pathogen evolution and transmission patterns. Researchshould support the development of harmonized biobanks, multiplex diagnostic platforms and interoperable data systems to improve early detection, enable accurate differential diagnosis and enhance preparedness for future outbreaks.',
    ],
    '4': [
        'In the absence of licensed BDBV-specific vaccines or treatments, supportive care remains one of the most immediately actionable interventions for reducing mortality and improving patient outcomes.',
        'Research should identify the components of supportive and critical care that are most strongly associated with survival, define optimal clinical management strategies and determine how they can be standardized and safely implemented across different care settings. Particular attention should be given to the role and timing of and indications for advanced supportive interventions, including fluid resuscitation, haemodynamic support with vasoactive agents, mechanical ventilation, renal replacement therapy, extracorporeal membrane oxygenation, and other organ-support strategies.',
        'In parallel, research should examine how models of care delivery influence outcomes, including referral pathways, centralized versus decentralized care, post-discharge management and the infrastructure required to support optimized patient management. This includes treatment centre organization, patient flow, staffing, monitoring capacity, and the practical conditions needed to deliver high-quality care while maintaining infection prevention and control standards.',
    ],
    '5': [
        'Research should evaluate the therapeutic potential of monoclonal antibodies developed against other Orthoebolaviruses, particularly broadly neutralizing antibodies such as MBP134, while optimizing their use for BDBV infection. Preclinical data suggest particular interest in broad-spectrum antibodies, such as MBP134, which are capable of neutralizing several filovirus species. However, no clinical data specific to BVD are currently available, which limits the ability to anticipate real-world efficacy.',
        'Given high production costs, logistical constraints and the limited availability of monoclonal antibodies, it is essential to diversify the therapeutic portfolio and avoid relying exclusively on this class of products. Considerations regarding availability, manufacturing, and scale-up capacity must be integrated early to ensure accessibility during emergencies.',
        'The absence of virological and immunological correlates of progression, recovery and therapeutic response remains a major barrier to evaluating monoclonal antibodies and defining optimal therapeutic windows. Research should therefore explore and validate biomarkers associated with treatment response, with the aim of optimizing patient selection, treatment timing and the evaluation of therapeutic candidates.',
    ],
    '6': [
        'Clinical data on the effectiveness of broad-spectrum antivirals (remdesivir, obeldesivir) against BDBV infection are insufficient, and determinants of severity — including the role of co - infections such as malaria or HIV —remain poorly documented. Additional studies are needed to document antiviral activity, pharmacokinetics, tolerance and efficacy. These molecules have the advantage of being easier to produce, store and deploy, making them particularly suitable for resource-limited settings.',
        'Novel therapeutic strategies for treating BVD should be explored and evaluated, including immunomodulatory and other host-directed therapies with evidence of benefit in severe viral infections. Research should investigate their mechanisms of action and therapeutic potential in animal models, while identifying biomarkers and immunophenotypic profiles associated with treatment response.',
        'Research should also assess the role of viral persistence in immune-privileged sites in shaping therapeutic efficacy and explore the potential contribution of convalescent plasma where appropriate.',
        'High-quality data on the natural history of BDBV infections will be essential to define the optimal timing, patient selection, and safety and efficacy of these approaches and to support the design of future clinical trials.',
        'Combinations of monoclonal antibodies and antiviral agents should be explored. Evidence from other filoviruses and viral infections shows that combination therapies can enhance efficacy, reduce required doses, limit the emergence of resistance and improve survival.',
    ],
    '7': [
        'Research should compare the effectiveness of post-exposure prophylaxis (PEP) regimens based on different candidate molecules across different exposure categories and epidemiological contexts, while assessing their operational feasibility, including adherence, tolerability and acceptability. Particular attention should be given to evaluating the respective roles of intravenous remdesivir and orally administered obeldesivir, the ease of deployment of which could represent a major advantage for community-based PEP.',
        'Harmonized sampling across sites should support the characterization of immune and virological markers associated with protection or breakthrough infection, while evidence from therapeutics and animal models should inform the development of alternative formulations and combination approaches. The possibility of prolonged viral persistence and sexual transmission further underscores the need for early, scalable and easily deployable PEP strategies.',
        'Research should also identify the populations most likely to benefit from PEP by refining exposure-risk classification and eligibility criteria according to the epidemiological characteristics of BVD. A better understanding of transmission dynamics will be essential to optimize the targeting and implementation of PEP during future outbreaks',
    ],
    '8': [
        'Research should accelerate the development and evaluation of these vaccine candidates by strengthening animal models of BVD, harmonizing immunological assays and generating robust data on vaccine immunogenicity, durability and cross-protective immune responses.',
        'Priority should be given to identifying immune correlates of protection and validating immunobridging approaches, thereby reducing reliance on conventional efficacy trials that are difficult to conduct during rare outbreaks.',
        'Existing BDBV-specific (rVSV BDBV, HPIV3 BDBV, ChAdOx1 BDBV, mRNA BDBV) and pan-filovirus vaccine candidates represent the most promising long-term strategy for preventing BVD, but major scientific and operational challenges remain before they can be deployed.',
        'Finally, research should generate the evidence needed to optimize vaccination strategies in outbreak settings, including ring vaccination, prioritization of health care workers and other high-risk groups, and vaccination of underrepresented populations such as children, pregnant women and other vulnerable individuals. Defining optimal vaccination strategies will require a better understanding of BDBV transmission dynamics and the operational feasibility, effectiveness and acceptability of different deployment approaches.',
    ],
    '9': [
        'Establishing longitudinal cohorts of recovered patients, also called “survivors”, must begin during the current outbreak, as many critical virological, immunological and clinical data cannot be collected retrospectively once the outbreak has ended.',
        'Recovered patients represent both a vulnerable population and a unique research platform to advance understanding of BVD and evaluate the long-term impact of medical countermeasures. Unlike Ebola virus and Sudan virus, for which longitudinal cohorts have provided critical insights into viral persistence, immune responses and long-term sequelae, post-infection trajectories following BVD remain largely unknown.',
        'Longitudinal cohort studies are needed to investigate viral persistence in immune-privileged compartments and to assess its implications for recrudescence risk. They should characterize immune responses through integrated immunophenotyping and clinical follow-up, identify predictive biomarkers of viral persistence, protective immunity and long-term clinical outcomes and document the full spectrum of sequelae, including ocular, neurological and psychiatric complications. Research should also examine the social trajectories of recovered patients, including stigma, health care-seeking behaviours, social reintegration and quality of life, while paying particular attention to children, pregnant women and other vulnerable populations.',
        'Beyond improving understanding of post-BVD outcomes, harmonized survivor cohorts will provide an essential platform for evaluation of the impact of acute-phase treatments, PEP and other medical countermeasures on viral clearance, persistence in immune-privileged sites, protection against reinfection and the durability of immune responses. They will also support the identification of subgroups that require enhanced follow-up and will contribute to the development of clinically relevant endpoints, biomarkers and correlates of protection to inform future vaccine and therapeutic trials.',
    ],
    '10': [
        'Rapid operational evidence is needed to improve the effectiveness of outbreak control and care delivery. Research should assess infection prevention and control strategies both in and outside of health care settings, including exposure risks, adherence barriers, effectiveness and acceptability of personal protective equipment and practical adaptations for complex humanitarian or insecure environments.',
        'This priority should also address how care is organized in practice. Studies should evaluate centralized and decentralized treatment models, patient pathways, referral systems, treatment center layout, and the broader organization of services needed to maintain safe and effective care during outbreaks. The design and functioning of health care facilities can directly influence both caregiver safety and quality of care.',
        'Operational research should further document bottlenecks across the response, including diagnostic delays, disruptions to routine health services, contact tracing performance, workforce constraints and the impact of outbreaks on health care workers\' well-being and safety. Such evidence is essential for adapting response strategies in real time and for informing future preparedness.',
    ],
}

// Whether a broad priority was mapped against BVD-specific research only or all Ebola
// research. Also from CORC's mapping workbook; every sub-priority inherits its parent's scope.
export const ebolaPriorityScopes: { [priority: string]: 'bvd' | 'all' } = {
    '1': 'all',
    '2': 'all',
    '3': 'all',
    '4': 'all',
    '5': 'bvd',
    '6': 'bvd',
    '7': 'bvd',
    '8': 'bvd',
    '9': 'all',
    '10': 'all',
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

// Normalises the code segment extracted from a REDCap checkbox column name back
// to the canonical value the data dictionary declares, so record values match the
// values used by select-options, the filter hierarchy and the search index.
//
// The mapping comes from the dictionary itself (see resolveCanonicalCode); the
// caller must register it — prepareGrants and prepareTrials each do so before
// streaming their records. Without a registered dictionary this falls back to the
// legacy leading-'_' and ICTV rules.
const normaliseExtractedCode = (raw: string) => resolveCanonicalCode(raw)

export const convertRawGrantKeyToValuesArray = (rawGrant: RawGrant, target: string) => {
    return Object.keys(rawGrant)
        .filter(key =>
            key.includes(target) &&
            rawGrant[key] &&
            parseInt(rawGrant[key]) === 1
        )
        .map(key => {
            const splitKey = key.split('___')
            const formattedValue = normaliseExtractedCode(splitKey[1])
            return formattedValue !== null && formattedValue
        })
}

export const convertCheckBoxFieldToArray = (grant: RawGrant, field: string) => {
    return (
        Object.entries(grant)
            .filter(
                ([key, value]) =>
                    key.startsWith(`${field}___`) && value === '1',
            )
            .map(([key]) => normaliseExtractedCode(key.split('___')[1]))
    )
}

/**
 * Single-pass equivalent of calling `convertCheckBoxFieldToArray` once per
 * checkbox field PLUS `convertRawGrantKeyToValuesArray` once per prefix target.
 *
 * The originals each re-scan every key of the grant, so together they cost
 * O((numCheckboxFields + numPrefixTargets) × numKeys) per grant — the dominant
 * cost in prepareGrants on the full dataset. This walks the grant's keys ONCE and
 * buckets the checked codes, turning it into O(numKeys).
 *
 * Output is kept BYTE-IDENTICAL to the originals (proven by
 * scripts/verify-prepare-grants-parity.ts), so `grants.json.gz` and the Phase-3
 * content hashes are unchanged. The two predicates are preserved exactly:
 *   - checkbox fields: `value === '1'`, matched by the exact field name (the
 *     segment before the first `___`; checkbox field names never contain `___`).
 *   - prefix targets:  `value && parseInt(value) === 1`, matched by
 *     `key.includes(target)`.
 * Both normalise the code via `normaliseExtractedCode(key.split('___')[1])` and
 * push in key-iteration order.
 */
export const extractCheckboxAndPrefixFields = (
    grant: RawGrant,
    checkBoxFields: string[],
    prefixTargets: string[],
): {
    checkBoxFieldValues: { [field: string]: string[] }
    prefixValues: { [target: string]: string[] }
} => {
    const checkedByField: { [field: string]: string[] } = {}
    const prefixValues: { [target: string]: string[] } = {}

    for (const target of prefixTargets) {
        prefixValues[target] = []
    }

    for (const key in grant) {
        const value = grant[key]

        // Only checked cells can match either predicate; skip everything else
        // before the more expensive split/normalise below.
        const isCheckbox = value === '1'
        const isPrefix = !!value && parseInt(value) === 1

        if (!isCheckbox && !isPrefix) {
            continue
        }

        const separatorIndex = key.indexOf('___')

        if (separatorIndex === -1) {
            continue
        }

        const code = normaliseExtractedCode(key.split('___')[1])

        if (isCheckbox) {
            const field = key.slice(0, separatorIndex)
            let bucket = checkedByField[field]

            if (!bucket) {
                bucket = []
                checkedByField[field] = bucket
            }

            bucket.push(code)
        }

        if (isPrefix) {
            for (const target of prefixTargets) {
                if (key.includes(target)) {
                    prefixValues[target].push(code)
                }
            }
        }
    }

    // Every requested checkbox field gets an entry (empty when unchecked),
    // matching `checkBoxFields.map(f => convertCheckBoxFieldToArray(grant, f))`.
    const checkBoxFieldValues: { [field: string]: string[] } = {}

    for (const field of checkBoxFields) {
        checkBoxFieldValues[field] = checkedByField[field] ?? []
    }

    return { checkBoxFieldValues, prefixValues }
}

export const convertCommaSeparatedValueFieldToArray = (
    grant: RawGrant,
    field: string,
) => {
    if (!grant[field]) {
        return []
    }

    return grant[field]
        .split(',')
        .map(value => value.trim())
        .filter(value => value !== '')
}

export const grantPolicyRoadmaps =(rawGrant: any) => {
    // There are multiple policy roadmap visualization pages.
    // A grant can be marked for a specific roadmap using a flag (e.g., 'hundred_dm_flag').
    // If the flag is set to '1' (true), that grant is included in the hundred days mission visualizations.
    //
    // To enable search in the policy roadmap dropdown, we assign a new key to each grant called PolicyRoadmaps.
    // If a roadmap field is true, we add its corresponding label to the PolicyRoadmaps array.
    // This way, each dropdown option can be built from a label/value pair that matches entries in the array.
    // When a user selects a roadmap from the dropdown, we filter the dataset to include only grants tagged with that roadmap.
    
    const policyRoadmapFields = {
        'hundred_dm_flag': 'HundredDaysMissionFlag',
        'pandint_themes_flag': 'PandemicIntelligenceFlag'
    }
        
    let policyRoadmapValues: string[] = []

    Object.entries(policyRoadmapFields).forEach(([ key, value ]) => {
        if (rawGrant[key] === '1') {
            policyRoadmapValues.push(value)
        }
    })

    return {
        PolicyRoadmaps: policyRoadmapValues
    }
}