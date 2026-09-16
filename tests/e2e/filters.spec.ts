import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings, LOADING_DATASET_TEXT } from './helpers'

/**
 * react-select cover, asserted through the thing the user actually sees change.
 *
 * app/components/FilterSidebar.tsx swaps its heading from "Total Number Of Grants"
 * to "Filtered Grants Total" as soon as the filtered set is smaller than the whole
 * dataset. That makes the filter round trip — open the select, choose an option,
 * propagate through GlobalFilterContext, re-filter the dataset — observable without
 * knowing anything about the option that was picked.
 *
 * The selects are app/components/MultiSelect.tsx, each labelled "All <plural>" via
 * `aria-label`. Matching on the `All ` prefix avoids depending on
 * `pluralizeFilterLabel`.
 */
test('applying a filter narrows the dataset', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/grants/visualise', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText(LOADING_DATASET_TEXT)).toBeHidden({ timeout: 60_000 })

    // `exact` matters: a chart subtitle on the same page reads "Total Number of Grants",
    // and getByText is case-insensitive substring matching without it.
    const unfilteredTotal = page.getByText('Total Number Of Grants', { exact: true })
    await expect(unfilteredTotal).toBeVisible({ timeout: 45_000 })

    const select = page.getByRole('combobox', { name: /^All / }).first()
    await expect(select).toBeVisible({ timeout: 30_000 })
    await select.scrollIntoViewIfNeeded()

    // Options are fetched on focus (`loadOnClick`), so the menu is empty on the
    // first paint and fills in — wait for a real option rather than the menu box.
    await select.click()

    const firstOption = page.getByRole('option').first()
    await expect(firstOption, 'the select menu never populated').toBeVisible({
        timeout: 30_000,
    })
    await firstOption.click()

    await expect(
        page.getByText('Filtered Grants Total', { exact: true }),
        'the filter was selected but the dataset was never narrowed',
    ).toBeVisible({ timeout: 45_000 })

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
