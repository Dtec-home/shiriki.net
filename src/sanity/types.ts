/**
 * HAND-WRITTEN result types for the GROQ queries in `./lib/queries.ts`.
 *
 * These exist because Sanity TypeGen (`pnpm typegen`, see
 * `sanity-typegen.json`) needs a live schema extraction against a real
 * Sanity project to run, and this app must build and typecheck with
 * **no Sanity project configured**. Once a real project exists, run
 * `pnpm typegen` and replace this file's contents with the generated
 * output — keep the same exported names so importers don't need to change.
 *
 * Every type here is a best-effort hand match of its query's projection.
 * Keep this file in sync whenever a query in `./lib/queries.ts` changes.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type SanitySlug = {
  _type: 'slug'
  current: string
}

export type SanityImage = {
  _type: 'image'
  asset?: { _type: 'reference'; _ref: string } | null
  hotspot?: { x: number; y: number; height: number; width: number } | null
  crop?: { top: number; bottom: number; left: number; right: number } | null
  alt?: string
}

/**
 * Loosely-typed Portable Text block. Covers standard `block` nodes as well
 * as the custom embedded block types (`callout`, `codeBlock`, `quoteBlock`,
 * `divider`, inline `image`) — consumers should narrow on `_type`.
 */
export type PortableTextBlock = {
  _type: string
  _key: string
  [key: string]: unknown
}

export type Seo = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
  noIndex?: boolean
}

export type SocialLink = {
  _key: string
  platform?: 'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp'
  url?: string
}

export type CtaLink = {
  _key?: string
  label?: string
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type Address = {
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

export type Problem = {
  _key: string
  title?: string
  text?: string
  icon?: string
}

export type SecurityBadge = {
  _key: string
  icon?: string
  label?: string
}

export type UssdPanel = {
  eyebrow?: string
  code?: string
  body?: string
  cta?: CtaLink
}

export type AboutValue = {
  _key: string
  title?: string
  description?: string
  icon?: string
}

export type TeamMemberRef = {
  _id: string
  name?: string
  slug?: SanitySlug
  role?: string
  bio?: string
  avatar?: SanityImage
}

export type PricingPlan = {
  _key: string
  name?: string
  priceKES?: number
  period?: 'month' | 'year' | 'custom'
  description?: string
  features?: string[]
  highlighted?: boolean
  ctaLabel?: string
}

export type CategoryRef = {
  _id: string
  title?: string
  slug?: SanitySlug
}

export type PostAuthorRef = {
  _id: string
  name?: string
  slug?: SanitySlug
  avatar?: SanityImage
}

export type PostAuthorFull = {
  _id: string
  name?: string
  slug?: SanitySlug
  role?: string
  bio?: string
  avatar?: SanityImage
}

// ---------------------------------------------------------------------------
// siteSettingsQuery
// ---------------------------------------------------------------------------

export type SiteSettingsQueryResult = {
  name?: string
  tagline?: string
  logo?: SanityImage
  logoDark?: SanityImage
  contactEmail?: string
  salesEmail?: string
  phone?: string
  ussdCode?: string
  address?: Address
  socialLinks?: SocialLink[]
  footerBlurb?: string
  navLinks?: CtaLink[]
  defaultSeo?: Seo
} | null

// ---------------------------------------------------------------------------
// homePageQuery
// ---------------------------------------------------------------------------

export type HomePageQueryResult = {
  heroEyebrow?: string
  heroHeadline?: string
  heroSubheadline?: string
  heroPrimaryCta?: CtaLink
  heroSecondaryCta?: CtaLink
  heroBadgeText?: string
  problemBandEyebrow?: string
  problemBandHeading?: string
  problemBandIntro?: string
  problems?: Problem[]
  givingSectionHeading?: string
  givingSectionIntro?: string
  featuresSectionHeading?: string
  featuresSectionIntro?: string
  digitalHomeHeading?: string
  digitalHomeIntro?: string
  securityHeading?: string
  securityIntro?: string
  securityBadges?: SecurityBadge[]
  ussdPanel?: UssdPanel
  seo?: Seo
} | null

// ---------------------------------------------------------------------------
// aboutPageQuery
// ---------------------------------------------------------------------------

export type AboutPageQueryResult = {
  heading?: string
  intro?: string
  mission?: PortableTextBlock[]
  values?: AboutValue[]
  team?: TeamMemberRef[]
  seo?: Seo
} | null

// ---------------------------------------------------------------------------
// pricingPageQuery
// ---------------------------------------------------------------------------

export type PricingPageQueryResult = {
  heading?: string
  intro?: string
  plans?: PricingPlan[]
  comparisonNote?: string
  seo?: Seo
} | null

// ---------------------------------------------------------------------------
// legalPageQuery
// ---------------------------------------------------------------------------

export type LegalPageQueryResult = {
  _id: string
  title?: string
  slug?: SanitySlug
  lastUpdated?: string
  body?: PortableTextBlock[]
  seo?: Seo
} | null

// ---------------------------------------------------------------------------
// givingChannelsQuery
// ---------------------------------------------------------------------------

export type GivingChannelsQueryResult = Array<{
  _id: string
  name?: string
  description?: string
  icon?: string
  badge?: string
  order?: number
}>

// ---------------------------------------------------------------------------
// featuresQuery
// ---------------------------------------------------------------------------

export type FeaturesQueryResult = Array<{
  _id: string
  title?: string
  description?: string
  icon?: string
  bullets?: string[]
  order?: number
  emphasis?: boolean
}>

// ---------------------------------------------------------------------------
// testimonialsQuery
// ---------------------------------------------------------------------------

export type TestimonialsQueryResult = Array<{
  _id: string
  quote?: string
  authorName?: string
  authorRole?: string
  churchName?: string
  avatar?: SanityImage
  order?: number
}>

// ---------------------------------------------------------------------------
// faqsQuery
// ---------------------------------------------------------------------------

export type FaqsQueryResult = Array<{
  _id: string
  question?: string
  answer?: PortableTextBlock[]
  category?: string
  order?: number
}>

// ---------------------------------------------------------------------------
// postsQuery
// ---------------------------------------------------------------------------

export type PostsQueryResult = Array<{
  _id: string
  title?: string
  slug?: SanitySlug
  excerpt?: string
  coverImage?: SanityImage
  author?: PostAuthorRef | null
  categories?: CategoryRef[]
  publishedAt?: string
}>

// ---------------------------------------------------------------------------
// postBySlugQuery
// ---------------------------------------------------------------------------

export type PostBySlugQueryResult = {
  _id: string
  title?: string
  slug?: SanitySlug
  excerpt?: string
  coverImage?: SanityImage
  body?: PortableTextBlock[]
  author?: PostAuthorFull | null
  categories?: CategoryRef[]
  publishedAt?: string
  seo?: Seo
} | null

// ---------------------------------------------------------------------------
// postSlugsQuery
// ---------------------------------------------------------------------------

export type PostSlugsQueryResult = string[]

export type PostSitemapQueryResult = Array<{
  slug: string
  _updatedAt: string
}>

// ---------------------------------------------------------------------------
// allContentForLlmsQuery
// ---------------------------------------------------------------------------

export type AllContentForLlmsQueryResult = {
  siteSettings: {
    name?: string
    tagline?: string
    contactEmail?: string
    salesEmail?: string
    phone?: string
    ussdCode?: string
  } | null
  homePage: {
    heroHeadline?: string
    heroSubheadline?: string
    problemBandHeading?: string
    problemBandIntro?: string
    problems?: Problem[]
    givingSectionHeading?: string
    givingSectionIntro?: string
    featuresSectionHeading?: string
    featuresSectionIntro?: string
    digitalHomeHeading?: string
    digitalHomeIntro?: string
    securityHeading?: string
    securityIntro?: string
  } | null
  aboutPage: {
    heading?: string
    intro?: string
    mission?: PortableTextBlock[]
  } | null
  pricingPage: {
    heading?: string
    intro?: string
    plans?: PricingPlan[]
    comparisonNote?: string
  } | null
  givingChannels: Array<{ name?: string; description?: string; badge?: string }>
  features: Array<{ title?: string; description?: string; bullets?: string[] }>
  faqs: Array<{ question?: string; answer?: PortableTextBlock[]; category?: string }>
  posts: Array<{
    title?: string
    slug: string | null
    excerpt?: string
    publishedAt?: string
    body?: PortableTextBlock[]
  }>
}
