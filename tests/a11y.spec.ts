import { test, expect, type Page } from '@playwright/test'

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
