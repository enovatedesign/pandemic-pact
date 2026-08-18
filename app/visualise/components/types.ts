/**
 * A resolved jump-card/menu item — the dataset-agnostic shape consumed by the
 * shared JumpCards grid and ScrollJumpBar. Dataset-specific data (e.g. the grants
 * disease/outbreak switches) is resolved down to this before rendering.
 */
export interface JumpCardItem {
    title: string
    summary?: string
    /** Anchor (or external) link; null renders a non-linking card. */
    url: string | null
    image?: {
        url: string
        altText: string
        width: number
        height: number
    }
}

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
