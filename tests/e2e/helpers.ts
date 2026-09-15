import { Page } from '@playwright/test'

/**
 * Collects uncaught exceptions and console errors from a page.
 *
 * Only `pageerror` is treated as a failure: the app has no error.tsx anywhere,
 * so an uncaught client-side exception leaves a broken page behind a 200. Console
 * errors are collected for the report but not asserted on — third-party tags
 * make them too noisy to gate a deploy.
 */
export function collectPageErrors(page: Page) {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', e => pageErrors.push(e.message))
    page.on('console', message => {
        if (message.type() === 'error') {
            consoleErrors.push(message.text())
        }
    })

    return { pageErrors, consoleErrors }
}

/** Text the charts show when their dataset is empty — see NoDataText. */
export const NO_DATA_TEXT = /No data available due to applied filters?\./

/** Sidebar label shown while a dashboard's dataset is still downloading. */
export const LOADING_DATASET_TEXT = 'Loading Dataset'

/**
 * Console messages that mean a framework is unhappy, as opposed to a third-party
 * tag being noisy.
 *
 * `collectPageErrors` deliberately does not gate on console errors, because GTM and
 * friends make the raw stream unusable. React, Headless UI and Recharts, though,
 * report most of their breakage here and never throw — a deprecated prop or a
 * changed render contract shows up as a console error behind an HTTP 200. Matching a
 * narrow allow-list keeps that signal without reinstating the noise.
 */
const FRAMEWORK_WARNING_PATTERNS = [
    /Warning:/,
    /Each child in a list should have a unique/,
    /Invalid hook call/,
    /Cannot update a component/,
    /Hydration failed/,
    /did not match|Text content does not match/,
    /is deprecated|was removed in React|no longer supported/i,
    /Accessing element\.ref/,
    /Headless ?UI/i,
    /recharts/i,
    /react-spring/i,
]

/**
 * Filters a console-error stream down to framework complaints.
 *
 * Kept separate from `collectPageErrors` so specs opt in: the existing suite runs
 * against production deployments where third-party tags are live, and should stay
 * on the pageerror-only contract.
 */
export function frameworkWarnings(consoleErrors: string[]) {
    return consoleErrors.filter(text =>
        FRAMEWORK_WARNING_PATTERNS.some(pattern => pattern.test(text)),
    )
}
