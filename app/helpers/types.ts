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

export type PathogenKey = `${string}Pathogen` // Dynamic keys ending in "Pathogen"

export interface FixedSelectOptionsBase {
    "Families": {
        label: string
        value: string
    }
    "Disease": {
        label: string
        value: string
    }
}

// Use `&` to merge with dynamic keys
export type FixedSelectOptions = FixedSelectOptionsBase & {
    [K in PathogenKey]?: {
        label: string
        value: string
    }
}
