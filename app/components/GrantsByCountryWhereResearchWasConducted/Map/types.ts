export type LocationType = 'Funder' | 'ResearchInstitution' | 'ResearchLocation'

export interface MapControlState {
    displayKnownFinancialCommitments: boolean
    displayWhoRegions: boolean
    locationType: LocationType
}
