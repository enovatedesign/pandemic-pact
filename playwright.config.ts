import { defineConfig, devices } from '@playwright/test'

/**
 * Browser checks against a deployed URL (set SMOKE_BASE_URL). These cover the
 * failures that still return HTTP 200: charts rendering fallback data, a
 * dashboard stuck on its loading spinner, an explore page throwing client-side
 * because the search API returned 503 into code that never checks response.ok.
 */
export default defineConfig({
    testDir: './tests/e2e',
    // The dashboards fetch and process datasets of 30k records client-side.
    timeout: 90_000,
    expect: { timeout: 30_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: process.env.SMOKE_BASE_URL ?? 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    // The visualise pages, RRNA and the homepage render WebGL via
                    // deck.gl/MapLibre. Without a software rasteriser they fail in
                    // headless CI and every map-bearing spec reports a false failure.
                    args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'],
                },
            },
        },
    ],
})
