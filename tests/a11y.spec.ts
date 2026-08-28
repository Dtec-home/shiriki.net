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
const ROUTES = ['/', '/about', '/pricing', '/contact', '/faq', '/blog', '/privacy', '/terms']

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
