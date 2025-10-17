type LabelMapping = {
    [key: number]: string;
}

// Mapping of Ebola CoRC Research Priority Areas to their labels
export const priorityLabels: LabelMapping = {
    1: 'Strengthen rapid diagnostics and laboratory capabilities',
    2: 'Advance therapeutic evaluations',
    3: 'Accelerate clinical trial approvals and regulatory preparedness',
    4: 'Optimize clinical care and supportive therapies',
    5: 'Expand understanding of pathophysiology and clinical complications',
    6: 'Enhance research on pre and post-exposure prophylaxis',
    7: 'Continue licensed vaccine deployment and next-generation development',
    8: 'Expand research on treatment center design and operational innovation',
    9: 'Scale-up training, preparedness, and data sharing',
    10: 'Support research in social science and community engagement',
}

// Mapping of Ebola CoRC Research Sub-Priority Areas to their labels via the priority number
export const subPriorityLabels: Record<number, LabelMapping> = {
    1: {
        1: 'Research on validation of rapid diagnostic tests (RDTs)',
        2: 'Research on deployment of minimal diagnostic panels to remote sites',
        3: 'Research on expansion of metagenomic sequencing for unexplained cases'
    },
    2: {
        1: 'Research on remdesivir and low-dose corticosteroids (in combination with monoclonal antibodies)',
        2: 'Research on Increasing monoclonal doses could be also evaluated'
    },
    4: {
        1: 'Research for refining the standard-of-care packages: fluidand electrolyte management, transfusion triggers, tranexamic acid (TXA), antimicrobial treatment of co-infections, and oxygen therapy',
        2: 'Protocols for children, neonates and pregnant women'
    },
    5: {
        1: 'Research on pathophysiology of EVD',
        2: 'Understanding Ebola-associated complications such as acute kidney injury, coagulopathy, neurologic sequelae, and bacterial or malaria co-infections, hinder effective treatment',
        3: 'Research on special populations like pregnant women, children, and survivors'
    },
    7: {
        1: 'Research on immunigenicity for immunobridgeing on next-generation vaccines'
    },
    8: {
        1: 'Research on treatment centre designs such as Integrated Disease Treatment Modules (IDTM), High-Efficiency Facilities (HEF), and CUBES',
        2: 'Operational research on referral pathways, logistics, and energy/water infrastructure'
    },
    10: {
        1: 'Research on communication strategies and address misinformation',
        2: 'Research assesing integration of social science with epidemiology to study sociocultural and behavioural determinants of health',
        3: 'Research on engaging communities early to build trust, address misinformation, and promote acceptance of clinical trials',
    },
}