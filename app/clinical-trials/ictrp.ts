/**
 * Builds a WHO ICTRP (trialsearch.who.int) record URL from a trial's
 * registration number.
 *
 * The `TrialNumber` field already matches the ICTRP TrialID across every
 * register — prefixes (`JPRN-`, `NL-`), suffixes (`-IT`) and slashes
 * (CTRI `.../...`) included — so it only needs URL-encoding. Verified against
 * ClinicalTrials.gov, ANZCTR, JPRN, CTRI, ChiCTR, EUCTR and OMON IDs.
 */
export function buildIctrpUrl(trialNumber: string): string {
    return `https://trialsearch.who.int/Trial2.aspx?TrialID=${encodeURIComponent(
        trialNumber,
    )}`
}
