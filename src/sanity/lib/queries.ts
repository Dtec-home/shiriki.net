import { defineQuery } from 'next-sanity'

/**
 * Typed GROQ queries for the Shiriki marketing site. Each query is
 * defined with `defineQuery` so Sanity TypeGen can generate result types
 * once a real project exists (see `pnpm typegen`). Until then, the matching
 * hand-written result types live in `src/sanity/types.ts`.
 *
 * Front-end fetches (Sprint 3+) should go through `sanityFetch` (see
 * `./fetch.ts`) and pass `{ next: { tags: [...] } }` using `typeTag`/
 * `slugTag` from `./live` so on-demand revalidation
 * (`app/api/revalidate/route.ts`) can target the right cache entries.
 */

// ---------------------------------------------------------------------------
// Site settings (header/footer, every page)
// ---------------------------------------------------------------------------

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0]{
    name,
    tagline,
    logo,
    logoDark,
    contactEmail,
    salesEmail,
    phone,
    ussdCode,
    address,
    socialLinks,
    footerBlurb,
    navLinks,
    defaultSeo,
  }
`)

// ---------------------------------------------------------------------------
// Home (/)
// ---------------------------------------------------------------------------

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0]{
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    heroPrimaryCta,
    heroSecondaryCta,
    heroBadgeText,
    problemBandEyebrow,
    problemBandHeading,
    problemBandIntro,
    problems,
    givingSectionHeading,
    givingSectionIntro,
    featuresSectionHeading,
    featuresSectionIntro,
    digitalHomeHeading,
    digitalHomeIntro,
    securityHeading,
    securityIntro,
    securityBadges,
    ussdPanel,
    seo,
  }
`)

// ---------------------------------------------------------------------------
// About (/about)
// ---------------------------------------------------------------------------

export const aboutPageQuery = defineQuery(`
  *[_type == "aboutPage"][0]{
    heading,
    intro,
    mission,
    values,
    team[]->{
      _id,
      name,
      slug,
      role,
      bio,
      avatar,
    },
    seo,
  }
`)

// ---------------------------------------------------------------------------
// Pricing (/pricing)
// ---------------------------------------------------------------------------

export const pricingPageQuery = defineQuery(`
  *[_type == "pricingPage"][0]{
    heading,
    intro,
    plans,
    comparisonNote,
    seo,
  }
`)

// ---------------------------------------------------------------------------
// Legal pages (/privacy, /terms) — by slug ("privacy" | "terms")
// ---------------------------------------------------------------------------

export const legalPageQuery = defineQuery(`
  *[_type == "legalPage" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    lastUpdated,
    body,
    seo,
  }
`)

// ---------------------------------------------------------------------------
// Giving channels (/  — giving section)
// ---------------------------------------------------------------------------

export const givingChannelsQuery = defineQuery(`
  *[_type == "givingChannel"] | order(order asc){
    _id,
    name,
    description,
    icon,
    badge,
    order,
  }
`)

// ---------------------------------------------------------------------------
// Features (/ — features grid)
// ---------------------------------------------------------------------------

export const featuresQuery = defineQuery(`
  *[_type == "feature"] | order(order asc){
    _id,
    title,
    description,
    icon,
    bullets,
    order,
    emphasis,
  }
`)

// ---------------------------------------------------------------------------
// Testimonials (/ — testimonials section)
// ---------------------------------------------------------------------------

export const testimonialsQuery = defineQuery(`
  *[_type == "testimonial"] | order(order asc){
    _id,
    quote,
    authorName,
    authorRole,
    churchName,
    avatar,
    order,
  }
`)

// ---------------------------------------------------------------------------
// FAQs (/ — FAQ section, or a dedicated /faq page)
// ---------------------------------------------------------------------------

export const faqsQuery = defineQuery(`
  *[_type == "faq"] | order(order asc){
    _id,
    question,
    answer,
    category,
    order,
  }
`)

// ---------------------------------------------------------------------------
// Blog index (/blog)
// ---------------------------------------------------------------------------

export const postsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    author->{
      _id,
      name,
      slug,
      avatar,
    },
    categories[]->{
      _id,
      title,
      slug,
    },
    publishedAt,
  }
`)

// ---------------------------------------------------------------------------
// Blog post detail (/blog/[slug])
// ---------------------------------------------------------------------------

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    body,
    author->{
      _id,
      name,
      slug,
      role,
      bio,
      avatar,
    },
    categories[]->{
      _id,
      title,
      slug,
    },
    publishedAt,
    seo,
  }
`)

export const postSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)].slug.current
`)

// Sitemap needs the last-modified timestamp alongside the slug, so it gets
// its own projection rather than reusing `postSlugsQuery` — that one returns
// bare slug strings for `generateStaticParams` and must stay that shape.
export const postSitemapQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt,
  }
`)

// ---------------------------------------------------------------------------
// llms.txt / llms-full.txt (app/llms.txt/route.ts, app/llms-full.txt/route.ts)
// — everything the AI-crawler routes need: posts with full body, FAQs with
// full answers, and the marketing pages' copy.
// ---------------------------------------------------------------------------

export const allContentForLlmsQuery = defineQuery(`
  {
    "siteSettings": *[_type == "siteSettings"][0]{
      name,
      tagline,
      contactEmail,
      salesEmail,
      phone,
      ussdCode,
    },
    "homePage": *[_type == "homePage"][0]{
      heroHeadline,
      heroSubheadline,
      problemBandHeading,
      problemBandIntro,
      problems,
      givingSectionHeading,
      givingSectionIntro,
      featuresSectionHeading,
      featuresSectionIntro,
      digitalHomeHeading,
      digitalHomeIntro,
      securityHeading,
      securityIntro,
    },
    "aboutPage": *[_type == "aboutPage"][0]{
      heading,
      intro,
      mission,
    },
    "pricingPage": *[_type == "pricingPage"][0]{
      heading,
      intro,
      plans,
      comparisonNote,
    },
    "givingChannels": *[_type == "givingChannel"] | order(order asc){
      name,
      description,
      badge,
    },
    "features": *[_type == "feature"] | order(order asc){
      title,
      description,
      bullets,
    },
    "faqs": *[_type == "faq"] | order(order asc){
      question,
      answer,
      category,
    },
    "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      body,
    },
  }
`)
