import { test, expect } from '@playwright/test'
import { collectPageErrors, frameworkWarnings } from './helpers'

/**
 * The homepage had no browser coverage at all, which mattered because it is the
 * only route that mounts three.js: app/components/RotatingGlobe.tsx is the sole
 * consumer of three, @react-three/fiber and @react-three/drei, and it is reached
 * only from app/HomepageClient.tsx. The same file tree carries the react-spring
 * `animated` wrappers, so a React 19 regression in either library shows up here
 * first.
 */
test('homepage renders and mounts the three.js globe', async ({ page }) => {
    const { pageErrors, consoleErrors } = collectPageErrors(page)

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Two h1s on this page: the masthead logo and the hero copy. #page-title is the latter.
    await expect(page.locator('#page-title')).toBeVisible({ timeout: 30_000 })

    // react-three-fiber mounts a <canvas> inside its <Canvas>. If the reconciler
    // fails to attach — the shape a fiber-major mismatch takes — the wrapper still
    // renders and only the canvas is missing.
    const canvas = page.locator('canvas').first()

    await expect(canvas, 'no canvas — the three.js globe did not mount').toBeAttached({
        timeout: 30_000,
    })

    // A zero-sized canvas means the renderer attached but never sized itself.
    const box = await canvas.boundingBox()
    expect(box?.width ?? 0, 'the globe canvas has no width').toBeGreaterThan(0)

    expect(frameworkWarnings(consoleErrors), 'framework warnings on /').toEqual([])
    expect(pageErrors, 'uncaught exceptions on /').toEqual([])
})
