import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings } from './helpers'

/**
 * The `params` contract for the two dynamic routes.
 *
 * scripts/smoke-test.ts already samples these over HTTP, but only checks the status
 * code — and a page that resolved the wrong record, or no record, still returns 200.
 * These are exactly the routes the async `params` migration rewrites: both
 * `generateMetadata` and the page component read `params.id` and pass it to
 * `loadGrant` / the trial lookup.
 *
 * Asserting that a title is present proves very little on its own, so each spec
 * asserts the pairing instead: two different ids must render two different records,
 * and an id that does not exist must 404. A `params` regression breaks one or both —
 * a page that renders the same record for every id passes a mere "has a heading"
 * check quite happily.
 *
 * Ids are sampled from the generated data the way smoke-test.ts does it, so the
 * specs survive a dataset change.
 */

const NONEXISTENT_ID = 'NOT-A-REAL-ID'

test('grant detail pages resolve their id to a record', async ({ page, request }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    const ids: string[] = await (await request.get('/data/grant-ids.json')).json()
    expect(ids.length, 'not enough grant ids to sample').toBeGreaterThan(1)

    const titles: string[] = []

    for (const id of [ids[0], ids[1]]) {
        await page.goto(`/grants/${id}`, { waitUntil: 'domcontentloaded' })

        const heading = page.locator('#page-title')
        await expect(heading, `/grants/${id} rendered no title`).toBeVisible({
            timeout: 45_000,
        })

        const text = (await heading.textContent())?.trim() ?? ''
        expect(text.length, `/grants/${id} rendered an empty title`).toBeGreaterThan(0)
        titles.push(text)
    }

    expect(
        titles[0],
        'two different grant ids rendered the same record — params is not reaching loadGrant',
    ).not.toBe(titles[1])

    const missing = await page.goto(`/grants/${NONEXISTENT_ID}`, {
        waitUntil: 'domcontentloaded',
    })
    expect(missing?.status(), 'an unknown grant id did not 404').toBe(404)

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})

test('clinical trial detail pages resolve their id to a record', async ({ page, request }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    const trials: Array<{ TrialID: string }> = await (
        await request.get('/data/clinical-trials/trials.json')
    ).json()
    expect(trials.length, 'not enough trials to sample').toBeGreaterThan(1)

    const titles: string[] = []

    for (const id of [trials[0].TrialID, trials[1].TrialID]) {
        await page.goto(`/clinical-trials/${id}`, { waitUntil: 'domcontentloaded' })

        const heading = page.locator('#page-title')
        await expect(heading, `/clinical-trials/${id} rendered no title`).toBeVisible({
            timeout: 45_000,
        })

        const text = (await heading.textContent())?.trim() ?? ''
        expect(text.length, `/clinical-trials/${id} rendered an empty title`).toBeGreaterThan(0)
        titles.push(text)
    }

    expect(
        titles[0],
        'two different trial ids rendered the same record — params is not reaching the lookup',
    ).not.toBe(titles[1])

    const missing = await page.goto(`/clinical-trials/${NONEXISTENT_ID}`, {
        waitUntil: 'domcontentloaded',
    })
    expect(missing?.status(), 'an unknown trial id did not 404').toBe(404)

    expect(frameworkWarnings(consoleErrors)).toEqual([])
    expect(pageErrors).toEqual([])
})
