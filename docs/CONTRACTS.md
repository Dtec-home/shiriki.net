# Kanisa Connect — Module Contracts

Parallel sprint agents must implement these exact module paths and export
names. Do NOT create a file owned by another agent; import against the
contract and trust it will exist.

## Already implemented (do not edit)

| Module | Exports |
|---|---|
| `@/lib/utils` | `cn` |
| `@/lib/site` | `SITE_NAME`, `SITE_TAGLINE`, `SITE_LOCALE`, `SITE_LANG`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`, `SITE_URL`, `CONTACT_EMAIL`, `SALES_EMAIL`, `CONTACT_PHONE`, `USSD_CODE`, `ORGANIZATION_ADDRESS`, `SOCIAL_LINKS`, `MARKET_COUNTRIES` |
| `@/sanity/env` | `apiVersion`, `dataset`, `projectId`, `isSanityConfigured`, `studioUrl` |

## Sprint 1 — Design System (agent: design-system)

| Module | Exports |
|---|---|
| `@/components/ui/button` | `Button`, `buttonVariants` |
| `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `@/components/ui/input` | `Input` |
| `@/components/ui/textarea` | `Textarea` |
| `@/components/ui/label` | `Label` |
| `@/components/ui/select` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` |
| `@/components/ui/dialog` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` |
| `@/components/ui/sheet` | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetClose` |
| `@/components/ui/accordion` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| `@/components/ui/badge` | `Badge`, `badgeVariants` |
| `@/components/ui/separator` | `Separator` |
| `@/components/ui/skeleton` | `Skeleton` |
| `@/components/ui/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| `@/components/ui/sonner` | `Toaster` |
| `@/components/layout/container` | `Container` — props `{ size?: 'prose' \| 'content' \| 'wide', as?, className, children }` |
| `@/components/layout/logo` | `Logo` — props `{ className?, tone?: 'default' \| 'inverted' }` |
| `@/components/motion/reveal` | `Reveal` |
| `@/components/motion/fade-in` | `FadeIn` |
| `@/components/motion/fade-in-up` | `FadeInUp` |
| `@/components/motion/stagger` | `Stagger`, `StaggerItem` |
| `@/components/motion/count-up-stat` | `CountUpStat` |
| `@/components/theme-provider` | `ThemeProvider` |
| `@/components/theme-toggle` | `ThemeToggle` |
| `@/app/globals.css` | design tokens (owned exclusively by this agent) |

## Sprint 2 — Sanity CMS (agent: sanity-cms)

| Module | Exports |
|---|---|
| `@/sanity/lib/client` | `client` |
| `@/sanity/lib/write-client` | `writeClient` (server-only) |
| `@/sanity/lib/image` | `urlFor`, `imageDimensions` |
| `@/sanity/lib/fetch` | `sanityFetch<TResult, TFallback>(query, params, options, fallback)` — never throws |
| `@/sanity/lib/live` | `typeTag(type)`, `slugTag(type, slug)` |
| `@/sanity/lib/queries` | `siteSettingsQuery`, `homePageQuery`, `aboutPageQuery`, `pricingPageQuery`, `legalPageQuery`, `givingChannelsQuery`, `featuresQuery`, `testimonialsQuery`, `faqsQuery`, `postsQuery`, `postBySlugQuery`, `postSlugsQuery`, `allContentForLlmsQuery` |
| `@/sanity/types` | hand-written result types (`SiteSettingsQueryResult`, `HomePageQueryResult`, `PostsQueryResult`, `PostBySlugQueryResult`, `FaqsQueryResult`, `GivingChannelsQueryResult`, `FeaturesQueryResult`, `TestimonialsQueryResult`, …) — must compile with **no** Sanity project configured |

Document types: `siteSettings`, `homePage`, `aboutPage`, `pricingPage`, `legalPage`,
`givingChannel`, `feature`, `testimonial`, `faq`, `post`, `author`, `category`, `inquiry`.

## Sprint 3 — SEO / AEO (agent: seo)

| Module | Exports |
|---|---|
| `@/lib/metadata` | `buildMetadata({ title, description, path, image, noIndex, type, publishedTime, modifiedTime })` → `Metadata` |
| `@/lib/json-ld` | `organizationSchema()`, `websiteSchema()`, `softwareApplicationSchema()`, `faqPageSchema(faqs)`, `articleSchema(post)`, `breadcrumbSchema(crumbs)` |
| `@/lib/portable-text-to-plain` | `portableTextToPlain(blocks)` |
| `@/components/seo/json-ld` | `JsonLd` — props `{ data: object \| object[] }` |
| `@/app/robots.ts`, `@/app/sitemap.ts`, `@/app/opengraph-image.tsx`, `@/app/llms.txt/route.ts`, `@/app/llms-full.txt/route.ts` | route handlers |

## Sprint 4 — Pages & Sections (agent: pages)

| Module | Exports |
|---|---|
| `@/lib/nav` | `MAIN_NAV`, `FOOTER_NAV` |
| `@/components/layout/header` | `Header` |
| `@/components/layout/footer` | `Footer` |
| `@/components/layout/mobile-nav` | `MobileNav` |
| `@/components/sections/*` | `Hero`, `ProblemBand`, `GivingChannels`, `FeaturesGrid`, `DigitalHome`, `SecurityBand`, `CtaBand`, `Testimonials`, `PricingTable` |
| `@/components/blog/*` | `PostCard`, `PortableTextRenderer`, `AuthorByline`, `ShareButtons`, `CodeBlock` |

Routes owned: `src/app/(site)/**`.

## Sprint 5 — Forms & Lead Capture (agent: forms)

| Module | Exports |
|---|---|
| `@/lib/contact-schema` | `contactSchema`, `demoRequestSchema`, types `ContactInput`, `DemoRequestInput` |
| `@/lib/rate-limit` | `checkRateLimit(key, limit?, windowMs?)` |
| `@/app/actions/contact` | `submitContact(prevState, formData)`, `submitDemoRequest(prevState, formData)`, type `FormState` |
| `@/components/forms/contact-form` | `ContactForm` |
| `@/components/forms/demo-request-dialog` | `DemoRequestDialog` — props `{ children?: React.ReactNode }` (renders its own trigger button when no children) |

## Hard rules for every agent

1. **Never edit a file outside your ownership list.** If you need a change
   elsewhere, note it in your final report instead.
2. The app must **build and render with no Sanity project and no Resend key**.
   Every data path needs a typed fallback.
3. Tailwind v4, CSS-first. Use design tokens only (`bg-primary`,
   `text-muted-foreground`) — no raw hex, no arbitrary pixel values.
4. Server Components by default. `"use client"` only where state, effects,
   or event handlers are genuinely required.
5. Path alias is `@/*` → `./src/*`.
6. Reference implementation to borrow from:
   `/home/md/Tweny5/2026/coseke_cloud/src` (read it, adapt it — do not copy
   Coseke branding or content).

---

## Sprint 6 — Performance & Accessibility (agent: polish)

Owns `src/components/**` and `src/app/(site)/**` for a11y/perf work.
Must not change public export names listed above, and must not touch
`src/lib/site.ts`, `src/lib/metadata.ts`, `src/lib/json-ld.ts`,
`src/lib/fallback-content.ts`, `src/sanity/**`, or `src/app/layout.tsx`.

## Sprint 7 — Analytics, i18n & Production (agent: production)

| Module | Exports |
|---|---|
| `@/lib/analytics` | `trackEvent(name, props?)`, `ANALYTICS_EVENTS` |
| `@/components/analytics/track-event` | `TrackEvent` (client wrapper) |
| `src/i18n/**` | locale config + `en`/`sw`/`fr` message catalogs |
| `tests/**`, `playwright.config.ts` | visual regression |
| `docs/BUILD_SPEC.md` | locked technical decisions |

Owns only the paths above. **Must not** edit existing components, pages, or
the root layout — report wiring points instead.
