import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings, LOADING_DATASET_TEXT } from './helpers'

/**
 * Recharts cover beyond "a surface exists".
 *
 * visualise.spec.ts asserts `.recharts-surface` is visible, which a chart that
 * rendered its axes and no data still satisfies. These check the marks themselves.
 *
 * The Sankey is the reason this file exists. app/components/RegionalFlowOfGrantsCard.tsx
 * passes hand-written `SankeyNode` / `SankeyLink` renderers, both typed `props: any`
 * and both adapted from the recharts demo repo. Recharts 3 reworked the custom-shape
 * contract, and because those props are `any`, `tsc` cannot see a break — the chart
 * simply renders nothing.
 */

test('grants charts render actual marks, not just axes', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#grants-by-research-category')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    const bars = card.locator('.recharts-bar-rectangle')

    await expect(bars.first(), 'the bar chart rendered no bars').toBeVisible({
        timeout: 45_000,
    })
    expect(await bars.count(), 'suspiciously few bars').toBeGreaterThan(1)

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})

test('the regional flow Sankey renders its nodes and links', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#regional-flow-of-grants')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    // Both shapes come out as <path>: SankeyNode renders a recharts `Rectangle`, which
    // draws a path rather than a <rect>. The two groups are separated by class, which
    // is what makes the custom-shape contract assertable — if recharts 3 stops calling
    // these renderers, the groups are still emitted but come out empty.
    const nodes = card.locator('.recharts-sankey-nodes path')
    const links = card.locator('.recharts-sankey-links path')

    await expect(nodes.first(), 'the Sankey rendered no nodes').toBeVisible({
        timeout: 45_000,
    })

    expect(await nodes.count(), 'the Sankey rendered too few nodes').toBeGreaterThan(2)
    expect(await links.count(), 'the Sankey rendered no links').toBeGreaterThan(0)

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
