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

export type DiseaseLabel = 'Mpox' | 'Pandemic-prone influenza' | 'default'
