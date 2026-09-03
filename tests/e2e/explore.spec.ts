import { test, expect } from '@playwright/test'
import { collectPageErrors } from './helpers'

/**
 * The explore pages are the only surfaces that depend on OpenSearch at runtime.
 *
 * A 503 from the search API does not degrade — app/helpers/search.ts reads
 * .json() without checking response.ok, so the error body is fed into state and
 * the render then dereferences searchResponse.total.value. The initial HTML is
 * still 200, so only a browser sees the failure.
 */

const pages = [
    { name: 'grants', path: '/grants/explore' },
    { name: 'clinical trials', path: '/clinical-trials/explore' },
]

pages.forEach(({ name, path }) => {
    test(`${name} explore returns results and does not throw`, async ({ page }) => {
        const { pageErrors, consoleErrors } = collectPageErrors(page)

        await page.goto(path, { waitUntil: 'domcontentloaded' })

        // Results render as <article> per hit, nested inside the page wrapper
        // <article> in Layout.tsx. Match only the nested ones: a bare `article`
        // selector also matches that wrapper, so an empty search index (HTTP 200,
        // zero hits) would still satisfy a "> 0" assertion.
        const results = page.locator('article article')

        await expect(results.first()).toBeVisible({ timeout: 45_000 })
        expect(await results.count(), 'expected at least one search result').toBeGreaterThan(0)

        if (consoleErrors.length > 0) {
            console.log(`console errors on ${path}:\n  ${consoleErrors.join('\n  ')}`)
        }

        expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([])
    })
})
