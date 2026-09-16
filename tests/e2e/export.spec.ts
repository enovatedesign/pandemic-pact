import { test, expect } from '@playwright/test'
import { collectPageErrors, LOADING_DATASET_TEXT } from './helpers'

/**
 * End-to-end cover for the failure that started all this: the export CSV was
 * missing from the deployment, fetchCsv threw, and the click produced nothing.
 *
 * Driven through the clinical-trials dashboard because its export is ~1 MB. The
 * grants export is >100 MB and is checked over HTTP in scripts/smoke-test.ts
 * instead of being pulled through a browser.
 */
test('exporting chart data downloads a real CSV', async ({ page }) => {
    const { pageErrors } = collectPageErrors(page)

    await page.goto('/clinical-trials/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    // The export menus live on the visualisation cards, which mount after the
    // dataset resolves — wait for the card rather than racing it.
    await expect(page.locator('.recharts-surface').first()).toBeVisible({ timeout: 45_000 })

    const exportMenu = page.getByRole('button', { name: 'Export', exact: true }).first()

    await exportMenu.scrollIntoViewIfNeeded()
    await exportMenu.click()

    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })

    // Headless UI's Menu.Item sets role="menuitem", overriding the inner button.
    await page.getByRole('menuitem', { name: /Export Chart Data \(CSV\)/ }).first().click()

    const download = await downloadPromise
    const stream = await download.createReadStream()

    let bytes = 0
    let head = ''

    for await (const chunk of stream) {
        if (head.length < 256) head += chunk.toString('utf-8').slice(0, 256)
        bytes += chunk.length
    }

    expect(bytes, 'the downloaded CSV is suspiciously small').toBeGreaterThan(1024)
    expect(head.startsWith('<'), 'an HTML error page was downloaded as a CSV').toBe(false)
    expect(head.split(',')[0]).toBe('TrialID')
    expect(pageErrors).toEqual([])
})

/**
 * The PNG path, which the CSV test above does not touch.
 *
 * app/components/ExportMenu/ExportImageMenuItem.tsx reaches into deck.gl internals
 * through a ref — `deckGlRef.current.deck.redraw('screenshot')` — to force the map
 * layers to paint before html2canvas snapshots the card. That is the pattern most
 * exposed to React 19's ref changes and to a deck.gl bump, and it fails silently:
 * the click resolves, no exception is thrown, and no file arrives.
 *
 * Driven from the grants dashboard because the geographical card is the one that
 * actually mounts deck.gl.
 */
test('exporting a chart image downloads a real PNG', async ({ page }) => {
    const { pageErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    const card = page.locator('#grants-by-research-category')
    await expect(card).toBeVisible({ timeout: 45_000 })
    await card.scrollIntoViewIfNeeded()

    await card.getByRole('button', { name: 'Export', exact: true }).click()

    const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })

    await page.getByRole('menuitem', { name: /Export Chart Image/ }).first().click()

    const download = await downloadPromise
    const stream = await download.createReadStream()

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    expect(buffer.length, 'the downloaded PNG is suspiciously small').toBeGreaterThan(1024)

    // PNG magic number. html2canvas failing mid-render yields a truncated or blank
    // data URL, which this catches where a size check alone would not.
    expect(
        buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        'the downloaded file is not a PNG',
    ).toBe(true)

    expect(pageErrors).toEqual([])
})
