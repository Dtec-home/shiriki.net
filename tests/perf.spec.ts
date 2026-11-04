import { test, expect } from '@playwright/test'

/**
 * Performance and link guards (sprint 2026-11 MKQ-3, moved out of the a11y
 * spec into the `perf` project by MKT-QA2). Runs once, in Chromium, against
 * the production build the config serves.
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

/**
 * Mobile performance guards (sprint 2026-11 MKQ-3, F-8). Lighthouse itself is
 * too slow and noisy for this suite (before/after numbers are in the progress
 * board); these pin the two causes that were fixed so they cannot creep back:
 *
 *   1. Above-the-fold copy is visible in the server HTML. The scroll-reveal
 *      wrappers used to render `opacity: 0` until hydration, which held the
 *      mobile LCP at ~4 s on every page.
 *   2. No page ships zod or the `motion` animation library: zod came in
 *      through the header's demo dialog, motion through the reveal wrappers.
 */
test.describe('mobile performance guards', () => {
  test.describe('first screen paints before hydration', () => {
    test.use({ contextOptions: { reducedMotion: 'no-preference' } })

    for (const route of ROUTES) {
      test(`${route} h1 and lead are opaque before hydration`, async ({ page }) => {
        // Block the JS bundles so the page never hydrates. (Disabling JS
        // altogether also stops React's inline streaming swaps, which leaves
        // the page body in a hidden segment — not what a slow phone sees.)
        await page.route('**/_next/static/**/*.js', (r) => r.abort())
        await page.goto(route, { waitUntil: 'load' })
        // React reveals streamed segments in throttled batches; wait for it.
        await page.locator('#main-content h1').waitFor({ state: 'attached', timeout: 5_000 }).catch(() => {})
        const hidden = await page.evaluate(() => {
          const h1 = document.querySelector('#main-content h1')
          if (!h1) return ['no <h1> in #main-content']
          const nodes = [h1, h1.parentElement?.querySelector('p')].filter(Boolean) as Element[]
          return nodes
            .map((el) => {
              let opacity = 1
              for (let node: Element | null = el; node; node = node.parentElement) {
                opacity *= Number(getComputedStyle(node).opacity)
              }
              return opacity < 0.99 ? `${el.tagName} "${el.textContent?.trim().slice(0, 40)}" (${opacity})` : null
            })
            .filter(Boolean)
        })
        expect(hidden, `hidden above-the-fold text on ${route}`).toEqual([])
      })
    }
  })

  for (const route of ['/', '/features/fundraising', '/contact']) {
    test(`${route} ships neither zod nor motion`, async ({ page }) => {
      const bodies: Promise<string>[] = []
      page.on('response', (response) => {
        if (response.request().resourceType() === 'script') bodies.push(response.text().catch(() => ''))
      })
      await page.goto(route, { waitUntil: 'networkidle' })
      const scripts = await Promise.all(bodies)
      expect(scripts.length).toBeGreaterThan(0)
      const zod = scripts.filter((s) => s.includes('ZodError')).length
      const motion = scripts.filter((s) => s.includes('framerAppearId') || s.includes('data-framer-appear-id')).length
      expect({ zod, motion }, `script chunks on ${route} containing zod / motion`).toEqual({ zod: 0, motion: 0 })
    })
  }
})

/**
 * Internal links (MKQ-3): every same-origin link on every route, plus every
 * sitemap URL, answers 200. Hash links are checked against their page only.
 */
test('no internal link or sitemap URL is broken', async ({ page, request, baseURL }) => {
  test.setTimeout(120_000)
  const origin = new URL(baseURL!).origin
  const targets = new Set<string>()
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
    for (const href of hrefs) {
      const url = new URL(href)
      if (url.origin === origin) targets.add(url.pathname)
    }
  }
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) targets.add(new URL(loc).pathname)
  expect(targets.size).toBeGreaterThanOrEqual(ROUTES.length)

  const broken: string[] = []
  for (const path of targets) {
    const response = await request.get(path, { maxRedirects: 5 })
    if (response.status() !== 200) broken.push(`${path} → ${response.status()}`)
  }
  expect(broken).toEqual([])
})

/**
 * MKT-QA2: the dialog primitives (base-ui Dialog/Sheet, the demo form's
 * Select) load on first open, not with the page. `base-ui-scroll-locked` is
 * the scroll-lock attribute only the dialog code contains.
 */
test('/ does not load the dialog code until a dialog is opened', async ({ page, request }) => {
  // Only the scripts the page's own HTML references: Next later prefetches
  // other routes' chunks for visible links, which may share base-ui code.
  const html = await (await request.get('/')).text()
  const srcs = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))]
  expect(srcs.length).toBeGreaterThan(0)
  const bodies = await Promise.all(srcs.map(async (src) => (await request.get(src)).text()))
  const withDialog = srcs.filter((_, i) => bodies[i].includes('base-ui-scroll-locked'))
  expect(withDialog, 'initial scripts with dialog code').toEqual([])

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('header').getByRole('button', { name: 'Request demo' }).click()
  await expect(page.getByRole('dialog', { name: 'Request a demo' })).toBeVisible()
})
