import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings } from './helpers'

/**
 * react-spring and swiper cover.
 *
 * The ContentBuilder blocks under app/components/ContentBuilder/ carry ten of the
 * twenty `animated` / `useInView` call sites and both swiper carousels, and no spec
 * visited a CMS page. They render through the `app/[...slug]` catch-all, so there is
 * no fixed path to point at — the page is picked out of the sitemap instead, which
 * keeps the spec working when the CMS content changes.
 */
test('a CMS content page renders its blocks', async ({ page, request }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    const sitemap = await (await request.get('/sitemap.xml')).text()

    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map(match => {
            try {
                return new URL(match[1]).pathname
            } catch {
                return ''
            }
        })
        // Everything else in the sitemap has its own spec; what is left is CMS.
        .filter(path => path && path !== '/')
        .filter(path => !/^\/(grants|clinical-trials|preview|api)\b/.test(path))

    test.skip(paths.length === 0, 'the sitemap lists no CMS pages to check')

    const path = paths[0]

    await page.goto(path, { waitUntil: 'domcontentloaded' })

    await expect(
        page.getByRole('heading', { level: 1 }),
        `${path} rendered no heading`,
    ).toBeVisible({ timeout: 45_000 })

    // The react-spring blocks animate in on scroll via `useInView`. Reaching the
    // bottom is what forces them to mount and run their springs.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(2_000)

    expect(frameworkWarnings(consoleErrors), `framework warnings on ${path}`).toEqual([])
    expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([])
})
