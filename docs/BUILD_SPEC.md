# Kanisa Connect — Build Spec

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
| Animation | `motion` (import from `motion/react`) | `^13.1.1` |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` | `^7.86.0`, `^5.9.1`, `^4.4.3` |
| CMS | Sanity, embedded Studio at `/studio` | `sanity ^6.10.1`, `next-sanity ^13.3.3` |
| Email | Resend | `^6.22.1` |
| Analytics | `@vercel/analytics` (pinned `1.6.1`) | mounted in `src/app/layout.tsx`, production-only |
| i18n foundation | `next-intl` (Sprint 7 — config + catalogs only, not wired) | `^4.13.7` |
| Testing | `@playwright/test` (Sprint 7 — visual regression + a11y smoke) | `^1.62.1` |
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
    layout/        Header, Footer, MobileNav, Container, Logo
    sections/      Hero, ProblemBand, GivingChannels, FeaturesGrid, DigitalHome,
                   SecurityBand, CtaBand, Testimonials, PricingTable
    blog/          PostCard, PortableTextRenderer, AuthorByline, ShareButtons, CodeBlock
    forms/         ContactForm, DemoRequestDialog
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
    contact-schema.ts  rate-limit.ts  reading-time.ts  fallback-content.ts
    analytics.ts                                         [Sprint 7]
tests/                                                    [Sprint 7]
  visual.spec.ts  a11y.spec.ts  visual.spec.ts-snapshots/
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
(`coseke.cloud`) consulted for build-spec format only; Kanisa Connect's own
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
--background: oklch(0.99 0.004 245);   --foreground: oklch(0.19 0.035 264);
--card: oklch(1 0 0);                  --primary: oklch(0.31 0.14 264);
--primary-foreground: oklch(0.98 0.01 250);
--secondary: oklch(0.79 0.16 82);      --secondary-foreground: oklch(0.2 0.05 264);
--muted: oklch(0.96 0.012 250);        --muted-foreground: oklch(0.49 0.04 260);
--accent: oklch(0.93 0.04 258);        --accent-foreground: oklch(0.31 0.14 264);
--destructive: oklch(0.577 0.245 27.325);
--border/--input: oklch(0.9 0.02 250); --ring: oklch(0.48 0.12 264);
--radius: 0.625rem;
```
**Dark** (`.dark` class, and `@media (prefers-color-scheme: dark)` for
system default before hydration — both paths assign the same `--dark-*`
recipe tokens so they never drift):
```
--background: oklch(0.16 0.018 264);   --foreground: oklch(0.96 0.008 250);
--primary: oklch(0.76 0.12 264);       --primary-foreground: oklch(0.16 0.03 264);
--secondary: oklch(0.74 0.13 82);      --muted: oklch(0.245 0.02 264);
--border: oklch(1 0 0 / 12%);          --ring: oklch(0.76 0.12 264);
```
Brand-tinted shadow scale (`--shadow-brand-{sm,md,lg,xl}`), indigo hue 264 at
4–8% opacity in light, near-black at 30–55% opacity in dark. Radius scale
derived from `--radius`: `sm` ×0.6, `md` ×0.8, `lg` ×1 (base), `xl` ×1.4,
`2xl` ×1.8, `3xl` ×2.2, `4xl` ×2.6.

## 6. Typography

Fonts loaded via `next/font/google` in `src/app/layout.tsx`:
- **Plus Jakarta Sans** — `--font-sans` (400/500/600/700/800, `display: swap`) and
  `--font-display` (700/800 weights only, same family — no separate serif/
  display face is used in this build, unlike the coseke.cloud reference).
- **IBM Plex Mono** — `--font-mono` (400/500/600, `display: swap`) — used for
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
| `DEMO_DIALOG_OPENED` | `DemoRequestDialog.handleOpenChange` — covers *every* demo trigger site-wide (header, hero, giving section, CTA band, pricing) |
| `DEMO_REQUEST_SUBMITTED` / `_SUCCEEDED` / `_FAILED` | `demo-request-dialog.tsx` — form `onSubmit` and the server-action result effect |
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
- **Visual regression** (`pnpm test:e2e`, or `pnpm exec playwright test`):
  `tests/visual.spec.ts` screenshots all 8 marketing routes in `light` and
  `dark` Playwright projects (16 screenshots), baselines committed under
  `tests/visual.spec.ts-snapshots/`. Builds + serves the production bundle
  via `playwright.config.ts`'s `webServer`. Verified passing across two
  independent fresh `pnpm build && pnpm start` cycles in this environment.
- **A11y smoke** (`tests/a11y.spec.ts`, `a11y` project): one `<h1>` per page,
  every `<img>` has an `alt` attribute, every visible form control has an
  accessible name, skip-link is the first focusable element. 41 total tests
  (16 visual + 24 a11y + 1 skip-link), all passing.
- **What this is not:** not a full axe-core accessibility audit, not a
  Lighthouse run (no Lighthouse score is reported anywhere in this repo —
  none was fabricated), not component/unit tests (none exist in this repo
  at any layer).

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
- **Rate limiting is in-memory, single-instance.** Fine at current scale;
  will not survive multi-instance/serverless horizontal scaling without a
  shared store (e.g. Upstash Redis) — not implemented.
- **No `/case-studies`, `/solutions`, `/industries`, `/partners`,
  `/certifications`, `/csr` routes.** Kanisa Connect's route set (§3) is
  smaller than the coseke.cloud reference project consulted for build-spec
  *format* only — this is by design, not a gap.
- **No component/unit test suite.** Only the Sprint 7 Playwright
  visual+a11y smoke tests exist; no Jest/Vitest, no React Testing Library.
- **Playwright browser binaries**: Chromium was already cached in this
  environment (`~/.cache/ms-playwright`) and verified to actually launch —
  see the final report for whether this holds in a clean CI environment.
