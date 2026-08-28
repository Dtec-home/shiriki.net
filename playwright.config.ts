import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for Kanisa Connect visual regression + a11y smoke tests
 * (Sprint 7.6). Builds the production app and serves it via `pnpm start` so
 * screenshots reflect the real production bundle (fonts, minified CSS,
 * `NODE_ENV=production` analytics gating), not the dev server.
 *
 * Determinism:
 * - Fixed 1280x800 viewport (no device pixel ratio surprises).
 * - `reducedMotion: 'reduce'` on every project — combined with the
 *   `@media (prefers-reduced-motion: reduce)` rule in `src/app/globals.css`
 *   (which zeroes animation/transition durations) and the design system's
 *   `motion` wrappers respecting `prefers-reduced-motion`, this makes reveal
 *   animations, hover transitions, and count-up stats resolve instantly
 *   instead of mid-animation, so screenshots are stable across runs.
 * - Two projects — `light` and `dark` — each running the full spec suite via
 *   `colorScheme`, so every route is captured in both themes without
 *   duplicating test code.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      // Small anti-aliasing/subpixel differences shouldn't fail a run; real
      // layout/content regressions are far larger than this threshold.
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
    // `reducedMotion` isn't a direct `use` option in this Playwright version's
    // types — it lives on the underlying browser-context options.
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'light',
      testMatch: 'visual.spec.ts',
      use: { ...devices['Desktop Chrome'], colorScheme: 'light' },
    },
    {
      name: 'dark',
      testMatch: 'visual.spec.ts',
      use: { ...devices['Desktop Chrome'], colorScheme: 'dark' },
    },
    {
      name: 'a11y',
      testMatch: 'a11y.spec.ts',
      // DOM structure doesn't change with color scheme, so this runs once
      // rather than once per theme.
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
