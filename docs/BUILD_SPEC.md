# Shiriki — Build Spec

Locked technical decisions for the codebase as it actually exists after
Sprints 0–7. This is a record of what was built, not a prescriptive plan —
every value below was read from the running code, not invented. See also
`docs/CONTRACTS.md` (module ownership) and `docs/DEPLOY.md` (deployment
runbook); this document does not duplicate either.

---

## 1. Stack and versions

| Concern | Locked choice | Version (from `package.json` / environment) |
|---|---|---|
| Framework | Next.js App Router | `16.3.0`, Turbopack build |
| Language | TypeScript, strict mode | `5.7.3` |
| UI library | React | `^19` |
| Package manager | pnpm | `10.33.0` |
| Node | — | `22.21.1` in this environment (`>=20 LTS` per DEPLOY.md expectations) |
| Styling | Tailwind CSS v4, CSS-first (`@import 'tailwindcss'`, `@theme`, no `tailwind.config.js`) | `^4.3.3`, `@tailwindcss/postcss ^4.3.3` |
| Components | shadcn/ui (new-york style), OKLCH tokens | `shadcn ^4.8.0` (CLI), primitives hand-owned in `src/components/ui` |
| Base primitives | `@base-ui/react` (Dialog/Sheet/Select/Accordion primitives under shadcn) | `^1.5.0` |
| Icons | lucide-react | `^1.16.0` |
| Animation | CSS scroll-driven reveals (`.reveal` in `globals.css`); `motion` (`motion/react`) only in the currently unused `CountUpStat` | `motion ^13.1.1` |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` | `^7.86.0`, `^5.9.1`, `^4.4.3` |
| CMS | Sanity, embedded Studio at `/studio` | `sanity ^6.10.1`, `next-sanity ^13.3.3` |
| Email | Resend | `^6.22.1` |
| Analytics | `@vercel/analytics` (pinned `1.6.1`) | mounted in `src/app/layout.tsx`, production-only |
| i18n foundation | `next-intl` (Sprint 7 — config + catalogs only, not wired) | `^4.13.7` |
| Testing | `@playwright/test` (visual, a11y incl. axe-core, perf/link guards); `node:test` for the seed and plans contract | `^1.62.1`, `axe-core 4.13.0` |
| Hosting target | Vercel | see `docs/DEPLOY.md` |

## 2. `src/` layout

```
src/
  app/
    layout.tsx                 root layout: fonts, ThemeProvider, Toaster, Analytics
    globals.css                design tokens (Sprint 1, owned exclusively by that agent)
    robots.ts / sitemap.ts / opengraph-image.tsx
    llms.txt/route.ts / llms-full.txt/route.ts
    actions/contact.ts         server actions (submitContact, submitDemoRequest)
    api/revalidate/route.ts    Sanity webhook receiver
    (site)/                    public route group — shares (site)/layout.tsx
      layout.tsx  page.tsx  about/  blog/  blog/[slug]/  contact/  faq/
      pricing/  privacy/  terms/  error.tsx  loading.tsx  not-found.tsx
    studio/[[...tool]]/        embedded Sanity Studio
  components/
    ui/            shadcn primitives (button, card, input, dialog, sheet, …)
    layout/        Header, Footer, MobileNav (+ lazily loaded mobile-nav-sheet), Container, Logo
    sections/      Hero, ProblemBand, GivingChannels, FeaturesGrid, DigitalHome,
                   SecurityBand, CtaBand, Testimonials, PricingTable
    blog/          PostCard, PortableTextRenderer, AuthorByline, ShareButtons, CodeBlock
    forms/         ContactForm, DemoRequestDialog (+ lazily loaded demo-request-form-dialog)
    motion/        Reveal, FadeIn, FadeInUp, Stagger/StaggerItem, CountUpStat
    seo/           JsonLd, OG image template/fonts
    analytics/     TrackEvent, ScrollDepth              [Sprint 7]
  sanity/
    schemaTypes/   singletons/, documents/, objects/, blocks/, icon.ts, index.ts
    lib/           client.ts, write-client.ts, image.ts, fetch.ts, live.ts, queries.ts
    env.ts  structure.ts  types.ts
  i18n/                                                  [Sprint 7]
    config.ts  request.ts  messages/{en,sw,fr}.json
  lib/
    site.ts  nav.ts  utils.ts  metadata.ts  json-ld.ts  portable-text-to-plain.ts
    contact-schema.ts  contact-options.ts  pricing-plans.ts  rate-limit.ts  reading-time.ts  fallback-content.ts
    analytics.ts                                         [Sprint 7]
tests/                                                    [Sprint 7]
  visual.spec.ts  a11y.spec.ts  perf.spec.ts  visual.spec.ts-snapshots/
  contract/      plans-contract.test.ts  plans-snapshot.json
scripts/check-plans-contract.ts                           [sprint 2026-11]
.github/workflows/ci.yml                                  [sprint 2026-11]
playwright.config.ts                                      [Sprint 7]
scripts/seed.ts
docs/
  CONTRACTS.md  DEPLOY.md  BUILD_SPEC.md  I18N.md
```

## 3. Route matrix

| Route | Source | Notes |
|---|---|---|
| `/` | `app/(site)/page.tsx` | `homePage` singleton; Hero, ProblemBand, GivingChannels, FeaturesGrid, DigitalHome, SecurityBand, Testimonials, CtaBand |
| `/about` | `app/(site)/about/page.tsx` | `aboutPage` singleton |
| `/pricing` | `app/(site)/pricing/page.tsx` | `pricingPage` singleton, renders `PricingTable` |
| `/contact` | `app/(site)/contact/page.tsx` | `ContactForm` → `submitContact` server action |
| `/faq` | `app/(site)/faq/page.tsx` | `faq` documents, shadcn `Accordion`, `FAQPage` JSON-LD |
| `/blog` | `app/(site)/blog/page.tsx` | `post` documents, paginated/listing |
| `/blog/[slug]` | `app/(site)/blog/[slug]/page.tsx` | `generateStaticParams`, `Article` JSON-LD |
| `/privacy` | `app/(site)/privacy/page.tsx` | `legalPage` document, `slug: "privacy"` |
| `/terms` | `app/(site)/terms/page.tsx` | `legalPage` document, `slug: "terms"` |
| `/studio/[[...tool]]` | `app/studio/[[...tool]]/page.tsx` | embedded Sanity Studio (admin auth) |
| `/api/revalidate` | `app/api/revalidate/route.ts` | Sanity webhook → `revalidateTag` |
| `/robots.txt` | `app/robots.ts` | allows AI crawlers explicitly (GPTBot, ClaudeBot, etc.) |
| `/sitemap.xml` | `app/sitemap.ts` | static routes + all `post` slugs |
| `/opengraph-image` | `app/opengraph-image.tsx` | branded default OG image |
| `/llms.txt`, `/llms-full.txt` | `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts` | AEO markdown summaries from Sanity + fallback content |

No `/case-studies`, `/solutions`, `/industries`, `/partners`, `/certifications`,
`/csr` routes exist — those were part of an unrelated reference project
(`coseke.cloud`) consulted for build-spec format only; Shiriki's own
route set is the eleven marketing/blog routes above plus the Studio/API/SEO
plumbing.

## 4. Sanity content model

**Singletons** (`SINGLETON_TYPES` in `src/sanity/structure.ts`, pinned in
Studio, one document each):
- `siteSettings` — name, tagline, logo/logoDark, contactEmail, salesEmail,
  phone, ussdCode, address, socialLinks, footerBlurb, navLinks, defaultSeo.
- `homePage` — hero (eyebrow/headline/subheadline/primary+secondary CTA/badge),
  problem band (eyebrow/heading/intro/problems[]), section headings for
  giving/features/digital-home, security (heading/intro/badges[]), a USSD
  panel (eyebrow/code/body/cta), seo.
- `aboutPage` — heading, intro, mission (Portable Text), values[]
  (title/description/icon), team (refs → `author`), seo.
- `pricingPage` — heading, intro, plans[] (name/priceKES/period/description/
  features[]/highlighted/ctaLabel), comparisonNote, seo.

**Documents (collections):**
- `legalPage` — used for both `/privacy` and `/terms` via `slug`.
- `givingChannel` — name, description, icon, badge, order.
- `feature` — title, description, icon, bullets[], order, emphasis.
- `testimonial` — quote, authorName, authorRole, churchName, avatar, order.
- `faq` — question, answer (Portable Text), category, order.
- `post` (blog) — title, slug, excerpt, coverImage (alt required), author
  (ref), categories (refs), publishedAt, body (Portable Text), seo.
- `author` — name, slug, role, bio, avatar.
- `category` — title, slug, description.
- `inquiry` — name/email/phone/churchName/country/message/source/createdAt
  all `readOnly: true` (written only by the contact/demo server actions);
  `status` (new/contacted/qualified/closed) is the one editable field, for
  Studio triage. Excluded from the "create new" menu
  (`HIDDEN_FROM_CREATE_TYPES`).

**Embedded objects:** `seo` (metaTitle/metaDescription/ogImage/noIndex),
`socialLink` (platform/url), `ctaLink` (label/href).

**Portable Text custom blocks** (`src/sanity/schemaTypes/blocks/`):
`callout`, `codeBlock`, `quoteBlock`, `divider`, used in `post.body`,
`faq.answer`, `aboutPage.mission`, `legalPage.body`.

**Revalidation tagging** (`src/sanity/lib/live.ts`): every type-level query
tags with `typeTag(type)` = `sanity:<type>`; detail queries additionally tag
with `slugTag(type, slug)` = `sanity:<type>:<slug>`. `app/api/revalidate/route.ts`
resolves the changed document's `_type` (+ `slug.current`) from the Sanity
webhook payload and calls `revalidateTag` for both.

**Studio desk structure** (`src/sanity/structure.ts`): pinned singletons at
the top, a "Content" group (giving channels, features, testimonials, FAQs,
legal pages), a "Blog" group (posts, authors, categories), and a read-only
"Inquiries" section pre-filtered by status.

## 5. Design tokens (from `src/app/globals.css`, OKLCH, verbatim)

**Light (`:root`):**
```
--background: oklch(0.985 0.004 247.858); --foreground: oklch(0.129 0.042 264.695);
--card: oklch(1 0 0);                     --primary: oklch(0.46 0.22 200);   /* teal */
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.968 0.007 247.896);  --secondary-foreground: oklch(0.208 0.042 265.755);
--muted: oklch(0.968 0.007 247.896);      --muted-foreground: oklch(0.52 0.046 257.417);
--accent: oklch(0.968 0.007 247.896);     --accent-foreground: oklch(0.208 0.042 265.755);
--destructive: oklch(0.577 0.245 27.325);
--border/--input: oklch(0.929 0.013 255.508); --ring: oklch(0.68 0.18 200);
--radius: 1rem;
```
**Dark** (`.dark` class, and `@media (prefers-color-scheme: dark)` for
system default before hydration — both paths assign the same `--dark-*`
recipe tokens so they never drift):
```
--background: oklch(0.129 0.042 264.695); --foreground: oklch(0.984 0.003 247.858);
--primary: oklch(0.68 0.18 200);          --primary-foreground: oklch(0.10 0.02 200);
--secondary/--muted: oklch(0.279 0.041 260.031); --muted-foreground: oklch(0.704 0.04 256.788);
--border: oklch(1 0 0 / 10%);             --ring: oklch(0.82 0.16 200);
```
**Contrast (WCAG AA 4.5:1, sprint 2026-11 MKQ-2):** `--primary` L 0.46 and
`--muted-foreground` L 0.52 were chosen for contrast: teal text 5.2:1 on
`--background`, white on teal 5.4:1, muted text ≥ 4.9:1 on every tinted
band. Text on a `bg-primary` surface uses `text-primary-foreground/90`
(4.7:1) and never a lower opacity. The `a11y` Playwright project runs
axe-core's `color-contrast` on every route in light and dark, so a token
change that breaks this fails the suite.

Brand-tinted shadow scale (`--shadow-brand-{sm,md,lg,xl}`), hue 264 at
4–8% opacity in light, near-black at 30–55% opacity in dark. Radius scale
derived from `--radius`: `sm` ×0.6, `md` ×0.8, `lg` ×1 (base), `xl` ×1.4,
`2xl` ×1.8, `3xl` ×2.2, `4xl` ×2.6.

## 6. Typography

Fonts loaded via `next/font/google` in `src/app/layout.tsx`:
- **Plus Jakarta Sans** — `--font-sans` (400/500/600/700/800, `display: swap`) and
  `--font-display` (700/800 weights only, same family — no separate serif/
  display face is used in this build, unlike the coseke.cloud reference).
- **IBM Plex Mono** — `--font-mono` (400/500/600, `display: swap`, `preload: false`
  since sprint 2026-11: small labels, mostly below the fold) — used for
  eyebrows/labels/USSD code/mono UI accents.

`h1`–`h6` use `var(--font-display)` with `letter-spacing: -0.015em`
(`globals.css` `@layer base`). No separate serif display face — headings and
body share Plus Jakarta Sans at different weights, a deliberate simplification
from the coseke.cloud two-serif-and-sans system this codebase's build-spec
format was modeled on.

## 7. Module contracts

See `docs/CONTRACTS.md` for the authoritative, per-sprint list. Sprint 7
(this sprint) added:

| Module | Exports |
|---|---|
| `@/lib/analytics` | `ANALYTICS_EVENTS`, `trackEvent(name, props?)`, types `AnalyticsEventName`, `AnalyticsEventProps` |
| `@/components/analytics/track-event` | `TrackEvent` (client wrapper, non-invasive `cloneElement` click tracking) |
| `@/components/analytics/scroll-depth` | `ScrollDepth` (client, renders nothing, reports 25/50/75/100% once each) |
| `@/i18n/config` | `LOCALES`, `DEFAULT_LOCALE`, `LOCALE_LABELS`, `RTL_LOCALES`, `isRtlLocale`, `isSupportedLocale`, type `Locale` |
| `@/i18n/request` | default export: `next-intl` `getRequestConfig` (not yet wired into `next.config.js` — see `docs/I18N.md`) |
| `src/i18n/messages/{en,sw,fr}.json` | 103 keys each, verified 1:1 parity |

## 8. Environment variable matrix

(Reproduced from `docs/DEPLOY.md` for a single-document reference; that file
is authoritative for setup steps.)

| Variable | Scope | Required | Build-time or runtime |
|---|---|:---:|---|
| `NEXT_PUBLIC_SITE_URL` | public | yes | both (canonical URLs, sitemap, OG) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public | no | both — empty ⇒ `isSanityConfigured = false`, all fallback content |
| `NEXT_PUBLIC_SANITY_DATASET` | public | no | both (default `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | public | no | both (default `2026-08-01`) |
| `SANITY_API_WRITE_TOKEN` | secret | no | runtime — inquiry writes + seed script only |
| `SANITY_REVALIDATE_SECRET` | secret | no | runtime — webhook signature check |
| `RESEND_API_KEY` | secret | no | runtime — missing ⇒ email skipped, lead still stored if Sanity is configured |
| `CONTACT_FROM_EMAIL` | secret | no | runtime |
| `CONTACT_TO_EMAIL` | secret | no | runtime (defaults to `SALES_EMAIL` in `src/lib/site.ts`) |

No env vars are required for `pnpm build` to succeed — verified in this
sprint with none of the optional variables set.

## 9. Graceful degradation policy

Hard requirement (see `docs/CONTRACTS.md` rule 2): the app builds and
renders correctly with **no Sanity project and no Resend key**.

- **Sanity:** `src/sanity/lib/fetch.ts`'s `sanityFetch` returns the caller's
  typed `fallback` value whenever `isSanityConfigured` is `false`, or whenever
  the real fetch throws (network error, GROQ error, wrong project/dataset).
  It never throws itself. Every page/section that reads from Sanity supplies
  a typed fallback (see `src/lib/fallback-content.ts` for the shared FAQ set,
  and inline `FALLBACK_*` constants in each `sections/*.tsx` component).
- **Resend / inquiry writes** (`src/app/actions/contact.ts`): Sanity writes
  and Resend sends are attempted independently, each in its own try/catch.
  Policy: success if *either* backend captured the lead; in development with
  neither configured, a friendly fake success lets the UI be built without
  secrets; in production with neither configured, a clear "email us
  directly" error (never a stack trace, never which backend failed).
- **Rate limiting** (`src/lib/rate-limit.ts`): in-memory, keyed by client IP,
  5 requests/minute default — resets on redeploy/cold start, which is an
  accepted limitation for the current traffic scale (see §10).

## 10. Analytics event catalogue (`src/lib/analytics.ts`)

Conversion funnel this catalogue is built to measure:

```
Landing (page_view, auto-tracked by <Analytics/>)
  -> cta_click (hero / pricing / nav / footer / cta-band CTA)
  -> demo_dialog_opened
  -> demo_request_submitted
  -> demo_request_succeeded  (or demo_request_failed)
```
Parallel, shorter funnel for the general contact form:
`contact_form_submitted -> contact_form_succeeded` (or `_failed`).

| `ANALYTICS_EVENTS` key | Event name | Fires when |
|---|---|---|
| `CTA_CLICK` | `cta_click` | Any primary/secondary CTA button or link click |
| `NAV_LINK_CLICK` | `nav_link_click` | A header/mobile-nav link is clicked |
| `FOOTER_LINK_CLICK` | `footer_link_click` | A footer column link is clicked |
| `DEMO_DIALOG_OPENED` | `demo_dialog_opened` | The demo-request dialog opens, any trigger |
| `DEMO_REQUEST_SUBMITTED` | `demo_request_submitted` | Demo form submitted, client-side |
| `DEMO_REQUEST_SUCCEEDED` | `demo_request_succeeded` | Server action returned success |
| `DEMO_REQUEST_FAILED` | `demo_request_failed` | Server action returned an error |
| `CONTACT_FORM_SUBMITTED` | `contact_form_submitted` | Contact form submitted, client-side |
| `CONTACT_FORM_SUCCEEDED` | `contact_form_succeeded` | Server action returned success |
| `CONTACT_FORM_FAILED` | `contact_form_failed` | Server action returned an error |
| `GIVING_CHANNEL_INTERACTION` | `giving_channel_interaction` | A giving-channel entry is interacted with |
| `USSD_SIMULATOR_INTERACTION` | `ussd_simulator_interaction` | A USSD simulator/demo widget is interacted with (no such widget exists in the codebase yet — event reserved for when one is built) |
| `PRICING_PLAN_SELECTED` | `pricing_plan_selected` | A pricing tier's CTA is chosen |
| `SCROLL_DEPTH` | `scroll_depth` | Once per 25/50/75/100% milestone, per page view |

`trackEvent(name, props?)` is a no-op outside `NODE_ENV=production`
(matching the root layout's `{process.env.NODE_ENV === 'production' &&
<Analytics />}` gate), guards `typeof window` for server-safety, and never
throws (blocked scripts / DNT / any runtime error are swallowed).

**Wired call sites** (completed at integration):

| Event | Where it fires |
|---|---|
| `DEMO_DIALOG_OPENED` | `DemoDialogHost` (in `demo-request-dialog.tsx`) when the dialog opens — covers *every* demo trigger site-wide (header, mobile menu, hero, giving section, CTA band, pricing) |
| `DEMO_REQUEST_SUBMITTED` / `_SUCCEEDED` / `_FAILED` | `demo-request-form-dialog.tsx` — form `onSubmit` and the server-action result effect |
| `CONTACT_FORM_SUBMITTED` / `_SUCCEEDED` / `_FAILED` | `contact-form.tsx` — same pattern |
| `CTA_CLICK` | `hero.tsx` (`location: 'hero'`), `cta-band.tsx` (`location: 'cta-band'`) via `TrackEvent` |
| `PRICING_PLAN_SELECTED` | `pricing-table.tsx`, `props: { tier }` via `TrackEvent` |
| `SCROLL_DEPTH` | `<ScrollDepth />` mounted once in `src/app/(site)/layout.tsx` |

`NAV_LINK_CLICK` / `FOOTER_LINK_CLICK` are defined but deliberately not
wired: internal navigation is already captured by Vercel Analytics'
automatic pageview tracking, so firing a custom event per link would
duplicate data without adding signal. Wire them only if per-link
attribution within a single page becomes a real question.

## 11. i18n status

Foundation only — see `docs/I18N.md` for the full cutover plan. Config +
`en`/`sw`/`fr` message catalogs (103 keys each) exist and are correct; no
route restructuring, middleware, or component wiring has been done.

## 12. Testing

- **Type/lint/build:** `pnpm typecheck && pnpm lint && pnpm build` — all
  clean as of this sprint.
- **Playwright** (`pnpm test:e2e`, or `pnpm exec playwright test`; set
  `PLAYWRIGHT_PORT` to serve elsewhere than 3000). The config builds and
  serves the production bundle (`webServer`). Four projects, 93 tests:
  - `light` / `dark` — `tests/visual.spec.ts`: full-page screenshots of the 9
    routes per theme (18), baselines in `tests/visual.spec.ts-snapshots/`.
  - `a11y` — `tests/a11y.spec.ts`: one `<h1>`, img alt, labelled controls,
    skip link, fundraising page content and SEO/AEO, reduced motion keeps
    content visible, axe-core `color-contrast` on every route in light and
    dark, and the dialogs (keyboard open, focus moves in, Escape, focus back
    to the trigger, axe WCAG A/AA inside the open dialog, desktop and 390px).
  - `perf` — `tests/perf.spec.ts`: heading and lead opaque before
    hydration, no zod or `motion` chunks, dialog code not in the initial
    scripts, every internal link and sitemap URL answers 200.
- **Plans contract** (`pnpm test:contract`): the site's plan bullets,
  cards, comparison table, prices and limits against the backend's
  `tenants/plans.py`, through `tests/contract/plans-snapshot.json`.
  `pnpm exec tsx scripts/check-plans-contract.ts --update [ref]` regenerates
  the snapshot from a backend checkout (`SHIRIKI_BACKEND_REPO`);
  `--verify-snapshot` checks it is current (skips without a backend unless
  `PLANS_CONTRACT_REQUIRE_BACKEND=1`). Change both in the same release (P-D14).
- **Seed content** (`pnpm test:seed`): `scripts/seed.test.ts`.
- **CI** (`.github/workflows/ci.yml`): install, typecheck, lint, seed,
  contract + `--verify-snapshot`, full Playwright.
- **Performance design (sprint 2026-11 MKQ-3 / MKT-QA2):** reveal wrappers
  (`Reveal`, `FadeIn`, `FadeInUp`, `Stagger`/`StaggerItem`) are server
  components that add the `.reveal` class: a CSS scroll-driven animation
  that runs only where `animation-timeline` is supported and the visitor has
  not asked for reduced motion. The server HTML is the final state, so
  above-the-fold content paints before any JS. `DemoRequestDialog` and
  `MobileNav` render plain triggers and fetch the dialog body (base-ui
  Dialog/Sheet/Select, the form) with `next/dynamic` on first open; focus
  returns to the trigger via `finalFocus`. Client forms import option lists
  from `contact-options.ts`, so zod stays server-side.
- **What this is not:** not a full axe-core audit of every rule on every
  page (contrast on all pages, WCAG A/AA inside dialogs), not a Lighthouse
  run (mobile Lighthouse is measured by hand; latest numbers are in the
  sprint progress board), not component/unit tests.

## 13. Known limitations / deferred / not yet built

- **i18n is not live.** No locale-prefixed routing, no middleware, no
  `useTranslations()` calls anywhere in `src/app/**` or `src/components/**`.
  See `docs/I18N.md` §7 for the ~6–10 day remaining-work estimate.
- **11 translated keys × 2 languages (22 total)** are flagged
  `__needs_review: true` for native-speaker polish before going live — see
  `docs/I18N.md`.
- **No USSD simulator widget exists.** `ANALYTICS_EVENTS.USSD_SIMULATOR_INTERACTION`
  is defined for when one is built; nothing fires it today.
- **`NAV_LINK_CLICK` / `FOOTER_LINK_CLICK` are defined but intentionally
  unwired** (redundant with automatic pageview tracking — see §10). All
  other events are wired.
- **Lighthouse, measured locally** (headless Chrome, desktop preset, home
  page, `pnpm build && pnpm start`): Performance 99, Accessibility 100,
  Best Practices 96, SEO 100; `/blog` Accessibility 100. Treat these as
  indicative only — local `pnpm start` is not a real deployment, and the
  one Best Practices deduction is a 404 for the Vercel Analytics script,
  which resolves once deployed. Re-measure against production per
  `docs/DEPLOY.md`.
- **Mobile Lighthouse is below 90 on most pages** (simulated moto g power,
  local `next start`). Sprint 2026-11 took it from 51–63 to 68–96 (median of
  3, MKQ-3) and page weight from 457–481 KiB to 273–349 KiB (MKT-QA2: dialogs
  loaded on first open). What remains is mostly React/Next hydration; /contact,
  /faq and /blog also carry their form or accordion. Local numbers swing
  with host load: always record the run's `benchmarkIndex`.
- **Rate limiting is in-memory, single-instance.** Fine at current scale;
  will not survive multi-instance/serverless horizontal scaling without a
  shared store (e.g. Upstash Redis) — not implemented.
- **No `/case-studies`, `/solutions`, `/industries`, `/partners`,
  `/certifications`, `/csr` routes.** Shiriki's route set (§3) is
  smaller than the coseke.cloud reference project consulted for build-spec
  *format* only — this is by design, not a gap.
- **No component/unit test suite.** Playwright plus two `node:test`
  suites (seed, plans contract); no Jest/Vitest, no React Testing Library.
- **Playwright browser binaries**: Chromium was already cached in this
  environment (`~/.cache/ms-playwright`) and verified to actually launch —
  see the final report for whether this holds in a clean CI environment.
