export interface RawGrant {
    [key: string]: string
}

export interface ProcessedGrant {
    [key: string]: string | string[] | number
}

export type Grant = ProcessedGrant
