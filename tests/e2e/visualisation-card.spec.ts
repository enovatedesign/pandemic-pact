import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings, LOADING_DATASET_TEXT } from './helpers'

/**
 * Headless UI cover. Both widgets here are rewritten in Headless UI 2 and neither
 * had any test.
 *
 * The `Tab` case is the sharper one. app/components/VisualisationCard.tsx renders a
 * `Tab.Group` containing only a `Tab.List` — there are no `Tab.Panels`, and the
 * panel content is rendered *outside* the group from a `useState` index driven by
 * `onChange`. Nothing about that is guaranteed by the library, so a change in when
 * `onChange` fires swaps the highlight without swapping the chart, which looks fine
 * in a screenshot and is wrong.
 */

test('visualisation card tabs swap the chart, not just the highlight', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#grants-by-research-category')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    // Bars renders a recharts BarChart, Scatter a ScatterChart — see
    // app/components/GrantsByResearchCategory/Card.tsx. The two are distinguishable
    // in the DOM, which is what makes this assertable.
    await expect(card.locator('.recharts-bar').first()).toBeVisible({ timeout: 45_000 })

    const scatterTab = card.getByRole('tab', { name: /Scatter/ })
    await expect(scatterTab).toBeVisible()
    await scatterTab.click()

    await expect(scatterTab, 'the tab did not become selected').toHaveAttribute(
        'aria-selected',
        'true',
    )

    await expect(
        card.locator('.recharts-scatter').first(),
        'the tab highlighted but the chart behind it never changed',
    ).toBeVisible({ timeout: 30_000 })

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})

test('info modal opens and closes', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#grants-by-research-category')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    // Wait for a positively-present client-rendered element before clicking. The
    // `LOADING_DATASET_TEXT` check above is an absence assertion, which a page that
    // has not hydrated yet also satisfies — and an un-hydrated button swallows the
    // click without error. The chart only exists once the card's client code has run.
    await expect(card.locator('.recharts-surface').first()).toBeVisible({ timeout: 45_000 })

    // app/components/InfoModal.tsx labels its trigger with an sr-only "Information".
    await card.getByRole('button', { name: 'Information' }).first().click()

    // Assert on the panel, not the dialog root: Headless UI puts role="dialog" on a
    // zero-sized `relative` wrapper and the visible panel sits inside it, so the root
    // itself never satisfies toBeVisible.
    const dialog = page.getByRole('dialog')
    const closeButton = dialog.getByRole('button', { name: 'Close' })

    await expect(closeButton, 'the Dialog never opened').toBeVisible({ timeout: 15_000 })

    await closeButton.click()

    await expect(dialog, 'the Dialog never closed').toBeHidden({ timeout: 15_000 })

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
