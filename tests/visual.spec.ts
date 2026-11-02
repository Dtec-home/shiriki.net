import { test, expect, type Page } from '@playwright/test'

/**
 * Visual regression: one full-page screenshot per key route, run under both
 * the `light` and `dark` Playwright projects (see playwright.config.ts) so
 * every route is captured in both themes automatically.
 *
 * First run on a clean checkout has no baseline images and will fail with
 * "no expected screenshot" — that's expected. Run
 * `pnpm exec playwright test --update-snapshots` once to generate the
 * `tests/visual.spec.ts-snapshots/` baseline, commit it, and subsequent runs
 * diff against it.
 *
 * Dark mode is forced via the `dark` localStorage key `next-themes` reads
 * (see `src/components/theme-provider.tsx`, which wraps `next-themes` with
 * `attribute="class"`), set before navigation so the very first paint is
 * already in the right theme — avoids a light->dark flash in the screenshot.
 */
const ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/faq',
  '/blog',
  '/privacy',
  '/terms',
  '/features/fundraising',
]

test.describe('visual regression', () => {
  for (const route of ROUTES) {
    test(`${route || '/'} renders and matches baseline`, async ({ page }, testInfo) => {
      const wantsDark = testInfo.project.name === 'dark'

      await page.addInitScript((dark) => {
        window.localStorage.setItem('theme', dark ? 'dark' : 'light')
      }, wantsDark)

      // Under `prefers-reduced-motion: reduce` the `Reveal` wrappers hydrate as
      // plain divs but keep the server's inline `opacity:0`, so sections stay
      // invisible (reported to the motion owner). Capture with motion allowed;
      // the scroll walk in `waitForStableLayout` reveals every section once.
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.goto(route, { waitUntil: 'networkidle' })
      await waitForStableLayout(page)

      const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')
      await expect(page).toHaveScreenshot(`${slug}.png`, { fullPage: true })
    })
  }
})

/**
 * Waits for `document.fonts.ready` and then polls document height until it
 * reports the same value several times in a row.
 *
 * Content-heavy routes (blog, FAQ, legal pages) were observed to settle at a
 * page height that differs by a couple of paragraph-heights depending on
 * exactly when a screenshot is taken relative to web-font swap and
 * client-component hydration (accordion, forms) completing — this page is
 * fully server-rendered with static fallback content (no live data, nothing
 * random), so the height itself is deterministic once everything has
 * settled; this just makes sure "settled" is what gets captured.
 */
async function waitForStableLayout(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)

  // Scroll-triggered `Reveal`/`Stagger` wrappers keep below-the-fold content
  // at opacity 0 until it enters the viewport, which made full-page shots
  // mostly blank. Walk the page once so every section has revealed, then
  // return to the top for the capture.
  await page.evaluate(async () => {
    const step = window.innerHeight / 2
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo(0, 0)
  })
  // Let the last reveal transitions (200 ms) finish.
  await page.waitForTimeout(400)

  let lastHeight = -1
  let stableReadings = 0
  const requiredStableReadings = 5

  for (let attempt = 0; attempt < 40 && stableReadings < requiredStableReadings; attempt++) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    if (height === lastHeight) {
      stableReadings++
    } else {
      stableReadings = 1
      lastHeight = height
    }
    await page.waitForTimeout(75)
  }
}
