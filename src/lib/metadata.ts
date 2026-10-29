import type { Metadata } from 'next'

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_CATEGORY,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site'

const TITLE_MAX = 60
const DESCRIPTION_MAX = 160

/** Join `SITE_URL` with a site-relative path into an absolute URL. */
function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

/**
 * Truncate `text` to at most `max` characters, breaking on the last word
 * boundary before the limit rather than mid-word, and appending an ellipsis.
 * Returns `text` unchanged when it already fits.
 */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const base = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return `${base.trimEnd()}…`
}

/**
 * Brand every title. A bare "Pricing" in a results page says nothing about
 * whose pricing, and "Shiriki" alone collides with other products, so the
 * longest brand suffix that fits wins: "| Shiriki Church Management System"
 * on short titles, "| Shiriki" on long ones (truncating the page part, never
 * the brand). Titles that already name the brand are left alone.
 */
function brandTitle(title: string): string {
  if (title.includes(SITE_NAME)) return truncate(title, TITLE_MAX)
  for (const suffix of [` | ${SITE_NAME} ${SITE_CATEGORY}`, ` | ${SITE_NAME}`]) {
    if (title.length + suffix.length <= TITLE_MAX) return `${title}${suffix}`
  }
  const suffix = ` | ${SITE_NAME}`
  return `${truncate(title, TITLE_MAX - suffix.length)}${suffix}`
}

export type BuildMetadataArgs = {
  /**
   * Final title for this page. Callers resolve the cascade themselves
   * (e.g. `seo?.metaTitle || pageFallbackTitle`) before passing it in; this
   * function only falls back to the site-wide default when nothing at all
   * is supplied.
   */
  title?: string | null
  /** Final description for this page, same cascade discipline as `title`. */
  description?: string | null
  /** Site-relative path, e.g. `/pricing`, used for canonical + og:url. */
  path: string
  /** Absolute or site-relative OG/Twitter image URL. Defaults to the branded `/opengraph-image`. */
  image?: string | null
  /** Hide this page from search engines (still crawlable, just not indexed). */
  noIndex?: boolean | null
  /** OpenGraph object type. Blog posts should pass `'article'`. */
  type?: 'website' | 'article'
  /** ISO 8601 publish date, only meaningful with `type: 'article'`. */
  publishedTime?: string | null
  /** ISO 8601 last-modified date, only meaningful with `type: 'article'`. */
  modifiedTime?: string | null
}

/**
 * Builds a Next.js `Metadata` object shared by every route: title/description
 * with brand fallbacks and length guards, an absolute canonical URL, full
 * OpenGraph + Twitter card tags, and `robots` honouring `noIndex`.
 *
 * Cascade for `title`/`description`: explicit arg (which the caller may
 * itself have already resolved from a Sanity `seo` field) wins; when absent,
 * the site-wide brand defaults from `@/lib/site` are used.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex,
  type = 'website',
  publishedTime,
  modifiedTime,
}: BuildMetadataArgs): Metadata {
  const resolvedTitle = brandTitle(title?.trim() || DEFAULT_TITLE)
  const resolvedDescription = truncate(
    description?.trim() || DEFAULT_DESCRIPTION,
    DESCRIPTION_MAX,
  )
  const url = absoluteUrl(path)

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : absoluteUrl(image)
    : absoluteUrl('/opengraph-image')

  const images = [{ url: imageUrl, width: 1200, height: 630, alt: resolvedTitle }]

  const openGraphBase = {
    title: resolvedTitle,
    description: resolvedDescription,
    url,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images,
  }

  return {
    // Required for Next.js to resolve relative OG/Twitter image URLs
    // against the real origin instead of falling back to localhost.
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: SITE_KEYWORDS,
    applicationName: SITE_NAME,
    alternates: { canonical: url },
    // Search Console ownership, so the sitemap can be submitted and sitelinks
    // and rich results monitored. Set the token in Vercel; absent, no tag.
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph:
      type === 'article'
        ? {
            ...openGraphBase,
            type: 'article',
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
          }
        : { ...openGraphBase, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [imageUrl],
    },
  }
}
