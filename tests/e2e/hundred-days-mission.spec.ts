import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings, LOADING_DATASET_TEXT } from './helpers'

const HUNDRED_DAYS_MISSION_PATH = '/grants/visualise/policy-roadmaps/100-days-mission'

test('100 Days Mission study populations renders bars in every category row and its breakdown', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto(HUNDRED_DAYS_MISSION_PATH, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#study-populations')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    // Each category row is its own chart; one without a bar is a row drawn blank.
    const rowCharts = card.locator('.recharts-surface')
    await expect(rowCharts.first(), 'the chart rendered no category rows').toBeVisible({ timeout: 45_000 })

    const rowCount = await rowCharts.count()
    for (let index = 0; index < rowCount; index++) {
        await expect(
            rowCharts.nth(index).locator('.recharts-bar-rectangle').first(),
            `category row ${index + 1} rendered no bars`,
        ).toBeAttached()
    }

    await card.getByRole('button', { name: 'View Breakdown' }).first().click()

    await expect(
        card.locator('.recharts-bar-rectangle').first(),
        'the breakdown rendered no bars',
    ).toBeVisible({ timeout: 45_000 })

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
