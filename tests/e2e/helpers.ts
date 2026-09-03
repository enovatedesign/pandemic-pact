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
