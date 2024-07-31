export type LocationType = 'Funder' | 'ResearchInstitution' | 'ResearchLocation'

export interface MapControlState {
    displayKnownFinancialCommitments: boolean
    displayWhoRegions: boolean
    locationType: LocationType
}

export interface FeatureProperties {
    id: string
    name: string
    colour: string
    totalGrants: number
    totalAmountCommitted: number
    totalJointGrants?: number
    totalJointAmountCommitted?: number
}
