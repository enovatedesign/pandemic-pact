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

export type DiseaseLabel = 'Mpox' | 'Pandemic-prone influenza' | 'Marburg virus disease' | 'default'

export interface ClinicalTrialCategoryPhase { 
    title: string
    value: string
    label: string 
}

export interface ClinicalTrialSubCategoryPhase { 
    value: string
    label: string 
}