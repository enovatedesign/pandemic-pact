import { test, expect } from '@playwright/test'
import { collectPageErrors, LOADING_DATASET_TEXT, NO_DATA_TEXT } from './helpers'

/**
 * The highest-value checks in the suite.
 *
 * When a dashboard's dataset fails to load, the fetch error is swallowed
 * (`.catch(console.error)`), the sidebar stays on its spinner, and the charts
 * fall back to app/components/NoData/visualisationFallbackData.ts — hardcoded
 * plausible data with real disease names — overlaid with "No data available due
 * to applied filters". A build carrying zero records is therefore
 * indistinguishable from a user over-filtering, and returns HTTP 200 throughout.
 *
 * With no filters applied on first load, that message must not appear.
 */

const dashboards = [
    { name: 'grants', path: '/grants/visualise' },
    { name: 'clinical trials', path: '/clinical-trials/visualise' },
]

dashboards.forEach(({ name, path }) => {
    test(`${name} visualise loads its dataset and renders real data`, async ({ page }) => {
        const { pageErrors, consoleErrors } = collectPageErrors(page)

        await page.goto(path, { waitUntil: 'domcontentloaded' })

        // The sidebar spinner stays up forever if the dataset fetch failed.
        await expect(
            page.getByText(LOADING_DATASET_TEXT),
            'the dataset never finished loading — its fetch most likely failed and was swallowed',
        ).toBeHidden({ timeout: 60_000 })

        // Target the Recharts surface specifically — a bare `svg` selector matches
        // the decorative aria-hidden icons in the nav, which are always present.
        await expect(
            page.locator('.recharts-surface').first(),
            'no charts rendered',
        ).toBeVisible({ timeout: 45_000 })

        // The fake-chart detector. No filters are applied on first load, so this
        // message can only mean the underlying dataset is empty.
        //
        // Asserting an absence cannot be done with a web-first assertion: both
        // toBeHidden() and toHaveCount(0) are already satisfied by a locator that
        // matches nothing, so either would resolve on the first poll and could
        // win the race against the overlay mounting. Settle first, then assert.
        await page.waitForTimeout(3_000)

        await expect(
            page.getByText(NO_DATA_TEXT),
            'charts fell back to placeholder data — the dataset behind this page is empty',
        ).toHaveCount(0)

        if (consoleErrors.length > 0) {
            console.log(`console errors on ${path}:\n  ${consoleErrors.join('\n  ')}`)
        }

        expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([])
    })
})
