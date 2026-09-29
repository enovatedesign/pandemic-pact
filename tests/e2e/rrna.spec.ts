import { test, expect, Page } from '@playwright/test'
import { collectPageErrors, frameworkWarnings, LOADING_DATASET_TEXT } from './helpers'

/**
 * The Rapid Research Needs Appraisals dashboard.
 *
 * Its bar charts draw one recharts chart per research domain, so a broken render
 * contract still leaves eight empty SVGs behind — enough to pass a "surface exists"
 * check. These assert the bars themselves, per row.
 */

const RRNA_PATH = '/rapid-research-needs-appraisals'

const BAR_CHART_CARDS = [
    '#distribution-of-studies-by-domain-and-study-design',
    '#distribution-of-studies-by-domains-study-design-and-study-populations',
]

async function gotoDashboard(page: Page) {
    await page.goto(RRNA_PATH, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })
}

for (const selector of BAR_CHART_CARDS) {
    test(`RRNA ${selector} renders bars in every domain row`, async ({ page }) => {
        const { pageErrors, consoleErrors } = collectPageErrors(page)

        await gotoDashboard(page)

        const card = page.locator(selector)
        await expect(card).toBeVisible({ timeout: 45_000 })
        await card.scrollIntoViewIfNeeded()

        const rows = card.locator('.bar-chart-category-label')
        await expect(rows.first(), 'the chart rendered no domain rows').toBeVisible()

        const bars = card.locator('.recharts-bar-rectangle')
        await expect(bars.first(), 'the chart rendered axes but no bars').toBeVisible({
            timeout: 45_000,
        })

        // Each domain row is its own chart; one without a bar is a row drawn blank.
        const rowCharts = card.locator('.recharts-surface')
        const rowCount = await rowCharts.count()
        expect(rowCount).toBe(await rows.count())

        for (let index = 0; index < rowCount; index++) {
            await expect(
                rowCharts.nth(index).locator('.recharts-bar-rectangle').first(),
                `domain row ${index + 1} rendered no bars`,
            ).toBeAttached()
        }

        expect(frameworkWarnings(consoleErrors)).toEqual([])
        expect(pageErrors).toEqual([])
    })
}

test('RRNA geographical distribution renders the map and its bars tab', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await gotoDashboard(page)

    const card = page.locator('#geographical-map-of-study-settings')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    const canvas = card.locator('canvas').first()
    await expect(canvas, 'the map did not mount').toBeVisible({ timeout: 45_000 })
    expect((await canvas.boundingBox())?.width ?? 0, 'the map canvas has no width').toBeGreaterThan(0)

    await card.getByRole('tab', { name: /Bars/ }).click()

    await expect(
        card.locator('.recharts-bar-rectangle').first(),
        'the Bars tab rendered no bars',
    ).toBeVisible({ timeout: 45_000 })

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
