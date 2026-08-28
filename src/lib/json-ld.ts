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

import type {
  Article,
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
  ORGANIZATION_ADDRESS,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from '@/lib/site'
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
    url: SITE_URL,
    logo: absoluteUrl('/opengraph-image'),
    sameAs: SOCIAL_LINKS.map((link) => link.url),
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
    name: SITE_NAME,
    url: SITE_URL,
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
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS, USSD',
    description:
      'Church management platform for African churches — member records, communication, events, finance, and mobile giving via M-Pesa and Airtel Money in one connected home.',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: '0',
      description: 'Flexible plans priced in Kenyan Shillings; contact sales for a quote.',
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
