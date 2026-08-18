import totals from '../../data/dist/homepage-totals.json'

interface Total {
    finalCount: number
    suffix?: string
}

interface HomepageTotals {
    totalCommittedUsd: Total
    totalGrants: Total
    totalFunders: Total
    totalClinicalTrials?: Total
}

/**
 * The clinical-trials count is merged into homepage-totals.json by the clinical
 * trials pipeline, which can bail out (no Figshare token, no cache) and leave
 * the key absent — hence optional, and callers must handle it being missing.
 */
const homepageTotals: HomepageTotals = totals

export default homepageTotals
