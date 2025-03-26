export interface CardEntryProps {
    uri?: string,
    url?: string,
    title: string,
    summary: string
    thumbnailImage: {
        url: string,
        width: number,
        height: number,
        alt: string,
    }
}

export type CardEntriesProps = Array<CardEntryProps>

export interface AnnouncementProps {
    dateUpdated: string
    announcementPersistent: boolean
    announcementShow: boolean
    announcementText?: string
    announcementTarget?: {
        customText?: string,
        text?: string,
        url?: string
        type?: string
    }
}

export type DiseaseLabel = 'Mpox' | 'Pandemic-prone influenza' | 'Marburg virus disease' | 'Ebola virus disease' | 'default'

export interface ClinicalTrialCategoryPhase { 
    title: string
    value: string
    label: string 
}

export interface ClinicalTrialSubCategoryPhase { 
    value: string
    label: string 
}

export interface FixedSelectOptions {
    "Families": {
        label: string
        value: string
    }
    "Diseases": {
        label: string
        value: string
    }
    "Pathogens": {
        label: string
        value: string
    }
    "Strains"?: {
        label: string
        value: string
    }
}

export interface FixedOutbreakSelectOptions {
    outbreakSelectOptions: FixedSelectOptions
    outbreakLevel: number
}

export interface CMSFamilyFilter {
    label: string
    value: string
    pathogens: CMSPathogenFilter[]
}

export interface CMSPathogenFilter {
    label: string
    value: string
    family: {
        label: string
        value: string
    }
    diseases: CMSDiseaseFilter[]
}

export interface CMSDiseaseFilter {
    label: string
    value: string
    pathogen: {
        label: string
        value: string
        family: {
            label: string
            value: string
        }
    }
    strains: CMSStrainFilter[]
}

export interface CMSStrainFilter {
    label: string
    value: string
    disease: {
        label: string
        value: string
        pathogen: {
            label: string
            value: string
            family: {
                label: string
                value: string
            }
        }
    }
}