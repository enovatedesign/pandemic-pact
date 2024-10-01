export interface CardEntryProps {
    url: string,
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
