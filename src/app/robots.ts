import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

/**
 * robots.txt — allow all crawlers, and EXPLICITLY allow the major AI
 * crawlers so Kanisa Connect content is eligible for AI search/answer
 * engines (AEO). Per-agent rules are required because some operators
 * (notably `Google-Extended`, `Applebot-Extended`) only respect their own
 * named directive, not the wildcard `*` rule.
 *
 * Per-document `noIndex` is enforced via page `robots` metadata (see
 * `buildMetadata`), not here — robots.txt governs crawling, not indexing of
 * individual documents.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

const DISALLOW = ['/studio', '/api']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
