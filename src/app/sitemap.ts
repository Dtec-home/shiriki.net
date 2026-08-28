import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'
import { sanityFetch } from '@/sanity/lib/fetch'
import { typeTag } from '@/sanity/lib/live'
import { postSitemapQuery } from '@/sanity/lib/queries'
import type { PostSitemapQueryResult } from '@/sanity/types'

/**
 * sitemap.xml — the static marketing routes plus every published blog post
 * slug from Sanity, each with `lastModified` from `_updatedAt`.
 *
 * With no Sanity project configured, `sanityFetch` resolves to the `[]`
 * fallback and the sitemap is just the static routes — still valid XML, and
 * the build never fails for lack of CMS data.
 */

const STATIC_ROUTES: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const posts = await sanityFetch<PostSitemapQueryResult, PostSitemapQueryResult>(
    postSitemapQuery,
    {},
    { next: { tags: [typeTag('post')] } },
    [],
  )

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => Boolean(post?.slug))
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post._updatedAt ? new Date(post._updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...staticEntries, ...postEntries]
}
