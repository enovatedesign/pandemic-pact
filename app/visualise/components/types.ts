export interface VisualisationCardDataProps {
    title: string
    summary: {
        "mpox"?: string
        "H5N1"?: string
        "Marburg virus disease"?: string
        "Ebola"?: string
        "default": string
    }
    url: {
        "mpox"?: string
        "H5N1"?: string
        "Marburg virus disease"?: string
        "Ebola"?: string
        "default": string 
    }
    image: {
        url: string
        altText: string
        width: number
        height: number
    }
    showCard: {
        "mpox"?: boolean
        "H5N1"?: boolean
        "Marburg virus disease"?: boolean
        "Ebola"?: boolean
        "default": boolean
    }
    showChevron: {
        "mpox"?: boolean
        "H5N1"?: boolean
        "Marburg virus disease"?: boolean
        "Ebola"?: boolean
        "default": boolean
    }
}
