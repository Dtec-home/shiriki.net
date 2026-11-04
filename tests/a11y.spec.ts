import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Accessibility smoke tests (Sprint 7.6). Deliberately narrow: these are
 * structural DOM assertions, not a full axe-core audit (no `@axe-core/playwright`
 * dependency was added — out of scope for this sprint). They catch the
 * cheapest, highest-value regressions:
 *
 *   1. Exactly one <h1> per page (a fundamental heading-structure rule).
 *   2. Every <img> has an `alt` attribute (empty `alt=""` is valid for
 *      decorative images — we only require the attribute to be PRESENT).
 *   3. Every form control (input/textarea/select) has an accessible name via
 *      a <label for>, aria-label, aria-labelledby, or being nested in a
 *      <label>. Hidden honeypot fields (aria-hidden ancestor) are excluded —
 *      they are intentionally never exposed to assistive tech.
 *   4. The skip-to-content link is the first focusable element on the page
 *      (Tab once from a fresh load lands on it).
 *
 * Runs under its own `a11y` Playwright project (see playwright.config.ts) —
 * not the `light`/`dark` visual-regression projects — since DOM structure
 * doesn't change with color scheme and re-running it per theme would just
 * double the runtime for no extra signal.
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

test.describe('a11y smoke', () => {
  for (const route of ROUTES) {
    test.describe(route || '/', () => {
      test('exactly one <h1>', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        const h1Count = await page.locator('h1').count()
        expect(h1Count, `expected exactly one <h1> on ${route}`).toBe(1)
      })

      test('every image has an alt attribute', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        const images = page.locator('img')
        const count = await images.count()
        for (let i = 0; i < count; i++) {
          const img = images.nth(i)
          const alt = await img.getAttribute('alt')
          const src = await img.getAttribute('src')
          expect(alt, `<img src="${src}"> on ${route} is missing an alt attribute`).not.toBeNull()
        }
      })

      test('every visible form control has an accessible name', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        const issues = await findUnlabeledControls(page)
        expect(issues, `unlabeled form controls on ${route}:\n${issues.join('\n')}`).toEqual([])
      })
    })
  }

  test('skip-to-content link is the first focusable element', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.keyboard.press('Tab')
    const active = page.locator(':focus')
    await expect(active).toHaveText(/skip to content/i)
    await expect(active).toHaveAttribute('href', '#main-content')
  })
})

/**
 * Fundraising feature page (sprint 2026-11 "Parity", MKT-5). Theme-independent
 * content checks live in the `a11y` project because it is the one project that
 * runs once rather than per colour scheme. With no Sanity project configured
 * the page renders its built-in fallback copy, which is what these assert.
 */
test.describe('/features/fundraising content', () => {
  test('responds 200 with the fundraising heading', async ({ page }) => {
    const response = await page.goto('/features/fundraising', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText(/fundrais|harambee|drive/i)
  })

  test('names every capability and the plan that includes it', async ({ page }) => {
    await page.goto('/features/fundraising', { waitUntil: 'domcontentloaded' })
    const main = page.locator('#main-content')
    for (const text of [/pledges/i, /champions/i, /public campaign page/i, /statement/i, /whatsapp group leaderboard/i, /fingerprint sign-in/i]) {
      await expect(main.getByText(text).first()).toBeVisible()
    }
    const plans = main.locator('[data-testid="fundraising-plans"]')
    await expect(plans).toContainText('Ukuaji')
    await expect(plans).toContainText('Kanisa')
    await expect(plans.locator('[data-plan="whatsapp-leaderboard"]')).toContainText('Kanisa')
    await expect(plans.locator('[data-plan="device-sign-in"]')).toContainText(/every plan/i)
  })

  test('copy stays brand-neutral', async ({ page }) => {
    await page.goto('/features/fundraising', { waitUntil: 'domcontentloaded' })
    const text = (await page.locator('#main-content').innerText()).toLowerCase()
    for (const word of ['sda', 'adventist', 'kawangware', 'sabbath', 'm-changa', 'catholic', 'anglican', 'pentecostal']) {
      expect(text, `found "${word}" on /features/fundraising`).not.toMatch(new RegExp(`\\b${word}\\b`))
    }
  })
})

/**
 * SEO / AEO surfaces for the fundraising page (MKT-6): sitemap, llms.txt,
 * llms-full.txt, the SoftwareApplication feature list and the page's own OG
 * image. All of these must hold with no Sanity project configured.
 */
test.describe('fundraising SEO and AEO', () => {
  test('sitemap lists the fundraising page', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    expect(body).toContain('/features/fundraising</loc>')
  })

  test('llms.txt links the fundraising page', async ({ request }) => {
    const body = await (await request.get('/llms.txt')).text()
    expect(body).toMatch(/- \[Fundraising campaigns\]\(https?:\/\/[^)]+\/features\/fundraising\)/)
  })

  test('llms-full.txt inlines the fundraising copy and plans', async ({ request }) => {
    const body = await (await request.get('/llms-full.txt')).text()
    expect(body).toContain('### Fundraising campaigns')
    expect(body).toMatch(/URL: https?:\/\/[^\s]+\/features\/fundraising/)
    expect(body).toMatch(/WhatsApp group leaderboard: Kanisa and above/)
    expect(body).toMatch(/Fingerprint sign-in on mobile: Every plan/)
  })

  test('SoftwareApplication featureList names the new features', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const app = blocks.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'SoftwareApplication')
    expect(app, 'SoftwareApplication JSON-LD on /').toBeTruthy()
    const list = (app.featureList as string[]).join(' | ')
    expect(list).toMatch(/fundraising campaigns/i)
    expect(list).toMatch(/whatsapp group leaderboard/i)
    expect(list).toMatch(/fingerprint sign-in/i)
  })

  test('fundraising page has its own OG image', async ({ page, request }) => {
    await page.goto('/features/fundraising', { waitUntil: 'domcontentloaded' })
    const og = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(og).toContain('/features/fundraising/opengraph-image')
    const image = await request.get(new URL(og!).pathname)
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toContain('image/png')
  })
})

/**
 * Returns a list of human-readable descriptions of form controls (input,
 * textarea, select) that lack an accessible name, excluding controls hidden
 * from assistive tech via an `aria-hidden` ancestor (e.g. honeypot fields)
 * or a `type="hidden"` input.
 */
async function findUnlabeledControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    function isAriaHidden(el: Element | null): boolean {
      let node: Element | null = el
      while (node) {
        if (node.getAttribute('aria-hidden') === 'true') return true
        node = node.parentElement
      }
      return false
    }

    function hasAccessibleName(el: HTMLElement): boolean {
      if (el.getAttribute('aria-label')?.trim()) return true
      const labelledBy = el.getAttribute('aria-labelledby')
      if (labelledBy && labelledBy.split(/\s+/).some((id) => document.getElementById(id)?.textContent?.trim())) {
        return true
      }
      const id = el.getAttribute('id')
      if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent?.trim()) return true
      if (el.closest('label')?.textContent?.trim()) return true
      const title = el.getAttribute('title')
      if (title?.trim()) return true
      return false
    }

    const controls = Array.from(document.querySelectorAll('input, textarea, select'))
    const problems: string[] = []

    for (const control of controls) {
      const el = control as HTMLElement
      const type = (el as HTMLInputElement).type
      if (type === 'hidden') continue
      if (isAriaHidden(el)) continue
      if (!hasAccessibleName(el)) {
        const name = el.getAttribute('name') || el.getAttribute('id') || el.outerHTML.slice(0, 80)
        problems.push(`<${el.tagName.toLowerCase()} name/id/snippet="${name}">`)
      }
    }

    return problems
  })
}

/**
 * Reduced motion: scroll-reveal wrappers (Reveal, Stagger, FadeIn, FadeInUp)
 * must leave every section fully visible, without scrolling, for visitors who
 * ask the OS for less motion. Playwright's `toBeVisible` ignores opacity, so
 * this multiplies computed opacity up each heading's ancestor chain.
 */
const REDUCED_MOTION_ROUTES = ['/', '/features/fundraising']

test.describe('reduced motion keeps content visible', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const route of REDUCED_MOTION_ROUTES) {
    test(`${route} section headings are opaque`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })
      await expect
        .poll(
          () =>
            page.evaluate(() =>
              Array.from(document.querySelectorAll('#main-content h1, #main-content h2'))
                .map((heading) => {
                  let opacity = 1
                  for (let node: Element | null = heading; node; node = node.parentElement) {
                    opacity *= Number(getComputedStyle(node).opacity)
                  }
                  return opacity < 0.99 ? `${heading.textContent?.trim()} (${opacity})` : null
                })
                .filter(Boolean),
            ),
          { message: `headings hidden under reduced motion on ${route}`, timeout: 3_000 },
        )
        .toEqual([])
    })
  }
})

test('header and footer link to the fundraising page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('header a[href="/features/fundraising"]').first()).toBeVisible()
  await expect(page.locator('footer a[href="/features/fundraising"]').first()).toBeVisible()
})

/**
 * Colour contrast (sprint 2026-11 "Parity", MKT-QA / MKQ-2, F-6): axe-core's
 * `color-contrast` rule (WCAG 2 AA, 4.5:1 body text, 3:1 large text) on every
 * route in both colour schemes. axe-core is injected straight from the
 * package rather than through @axe-core/playwright, and only this rule runs:
 * the structural checks above already cover headings, alt text and labels.
 */
const AXE_SOURCE = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8')

type ContrastIssue = { target: string; summary: string }

async function contrastViolations(page: Page): Promise<ContrastIssue[]> {
  await page.addScriptTag({ content: AXE_SOURCE })
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: { nodes: { target: unknown[]; failureSummary?: string; any: { message: string }[] }[] }[] }> } }).axe
    const result = await axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations'] })
    return result.violations.flatMap((v) =>
      v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.any[0]?.message ?? n.failureSummary ?? '' })),
    )
  })
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`colour contrast (${colorScheme})`, () => {
    test.use({ colorScheme, contextOptions: { reducedMotion: 'reduce' } })

    for (const route of ROUTES) {
      test(`${route} has no axe color-contrast violations`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' })
        const issues = await contrastViolations(page)
        expect(issues, `${route} (${colorScheme}):\n${issues.map((i) => `${i.target} — ${i.summary}`).join('\n')}`).toEqual([])
      })
    }
  })
}

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
