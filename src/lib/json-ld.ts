// Typed helper functions that build schema.org JSON-LD payloads. Each
// returns a plain object (typed against `schema-dts` where practical) that
// `<JsonLd>` serializes into a `<script type="application/ld+json">`. Kept
// framework-agnostic (no React) so they're easy to reuse and unit-test.
//
// Schemas implemented (Sprint 3):
//   - Organization         (root layout)        — brand identity + contact
//   - WebSite               (root layout)        — with a SearchAction
//   - SoftwareApplication   (home / pricing)      — the product itself
//   - FAQPage               (/faq)                — from faq docs
//   - Article               (blog post)           — with author/publisher
//   - BreadcrumbList        (any nested page)      — from a crumb trail
//   - SiteNavigationElement (root layout)        — the primary nav
//
// "Shiriki" is a common word shared with other products, so every entity
// here carries the category (`alternateName`, `description`, `keywords`)
// and the entities reference each other by `@id`. That linked graph is what
// lets a search engine treat this site as one brand and not a keyword match.

import type {
  Article,
  ItemList,
  BreadcrumbList,
  FAQPage,
  Organization,
  SoftwareApplication,
  WebSite,
  WithContext,
} from 'schema-dts'

import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEFAULT_DESCRIPTION,
  DEVELOPER_NAME,
  ORGANIZATION_ADDRESS,
  PLAY_STORE_URL,
  SITE_ALTERNATE_NAMES,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from '@/lib/site'
import type { NavLink } from '@/lib/nav'
import { portableTextToPlain } from '@/lib/portable-text-to-plain'

function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function organizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    slogan: SITE_TAGLINE,
    parentOrganization: { '@type': 'Organization', name: DEVELOPER_NAME },
    knowsAbout: SITE_KEYWORDS,
    areaServed: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'].map((name) => ({ '@type': 'Country', name })),
    // Google wants a square logo of at least 112x112px; the 1200x630 OG card
    // gets cropped. apple-icon.png is the 180x180 Shiriki mark.
    logo: absoluteUrl('/apple-icon.png'),
    // Only profiles verified as Shiriki's own. A sameAs to another
    // "Shiriki" account would merge the two brands — the opposite of the
    // point. Add SOCIAL_LINKS back here once each account is confirmed.
    sameAs: [PLAY_STORE_URL],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CONTACT_EMAIL,
        telephone: CONTACT_PHONE,
        areaServed: 'KE',
        availableLanguage: ['English', 'Swahili'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION_ADDRESS.streetAddress,
      addressLocality: ORGANIZATION_ADDRESS.addressLocality,
      addressRegion: ORGANIZATION_ADDRESS.addressRegion,
      postalCode: ORGANIZATION_ADDRESS.postalCode,
      addressCountry: ORGANIZATION_ADDRESS.addressCountry,
    },
  }
}

// ---------------------------------------------------------------------------
// WebSite
// ---------------------------------------------------------------------------

/**
 * `WebSite` schema.
 *
 * Defaults to NO `SearchAction`: the blog index does not currently read a
 * `q` query param, and advertising a search endpoint that doesn't work is a
 * false capability claim that search engines flag. Pass `true` only once
 * `/blog` actually handles `?q=`.
 */
export function websiteSchema(hasSearchRoute = false): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    // Google's site-name system reads `name` then `alternateName`.
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(hasSearchRoute
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          } as WebSite['potentialAction'],
        }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// SoftwareApplication
// ---------------------------------------------------------------------------

export function softwareApplicationSchema(): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Church Management System',
    operatingSystem: 'Web, Android, USSD',
    installUrl: PLAY_STORE_URL,
    downloadUrl: PLAY_STORE_URL,
    sameAs: [PLAY_STORE_URL],
    keywords: SITE_KEYWORDS.join(', '),
    description:
      'Shiriki is a church management system (ChMS) and church funds management system (CFMS) for African churches — member records, communication, events, finance, and mobile giving via M-Pesa, Airtel Money and USSD reconciled against the member register.',
    featureList: [
      'M-Pesa STK Push and PayBill giving with automatic reconciliation',
      'Airtel Money, card and USSD giving',
      'Church funds management: tithes, offerings, pledges and departments',
      'Member register, attendance and visitor follow-up',
      'SMS and push announcements and event reminders',
      'Android app for members',
    ],
    // Price range of the published monthly plans (Msingi to Kanisa; the
    // Shirikisho tier is quoted). A bare `price: '0'` would claim the product
    // is free, which it is not — only the 30-day trial is.
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'KES',
      lowPrice: '2000',
      highPrice: '7500',
      offerCount: 3,
      url: absoluteUrl('/pricing'),
      description: 'Monthly plans from KES 2,000, each with a 30-day free trial.',
    },
    provider: { '@id': `${SITE_URL}/#organization` },
  }
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export type FaqInput = {
  question: string
  /** Plain text, or Portable Text blocks flattened via `portableTextToPlain`. */
  answer: unknown
}

export function faqPageSchema(faqs: FaqInput[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          typeof faq.answer === 'string' ? faq.answer : portableTextToPlain(faq.answer),
      },
    })),
  }
}

// ---------------------------------------------------------------------------
// Article (blog post)
// ---------------------------------------------------------------------------

export type ArticleInput = {
  title: string
  description?: string | null
  path: string
  imageUrl?: string | null
  authorName?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
}

export function articleSchema(post: ArticleInput): WithContext<Article> {
  const url = absoluteUrl(post.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(post.description ? { description: post.description } : {}),
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(post.authorName
      ? { author: { '@type': 'Person', name: post.authorName } }
      : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export type BreadcrumbInput = { name: string; url: string }

export function breadcrumbSchema(crumbs: BreadcrumbInput[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : absoluteUrl(crumb.url),
    })),
  }
}

// ---------------------------------------------------------------------------
// SiteNavigationElement
// ---------------------------------------------------------------------------

/**
 * The primary nav as an `ItemList` of `SiteNavigationElement`s. Google picks
 * sitelinks algorithmically and does not promise to read this, but it states
 * the site's main sections plainly to every crawler, which is the input
 * sitelinks are built from.
 */
export function siteNavigationSchema(links: NavLink[]): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#navigation`,
    name: `${SITE_NAME} site navigation`,
    itemListElement: links.map((link, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: link.label,
      url: absoluteUrl(link.href),
    })),
  } as WithContext<ItemList>
}
