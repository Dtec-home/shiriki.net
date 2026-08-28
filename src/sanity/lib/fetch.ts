import type { QueryParams } from 'next-sanity'

import { isSanityConfigured } from '@/sanity/env'
import { client } from '@/sanity/lib/client'

/**
 * Resilient wrapper around `client.fetch`.
 *
 * With no Sanity project configured (`NEXT_PUBLIC_SANITY_PROJECT_ID` empty,
 * `client.ts` substitutes a placeholder project id), `client.fetch` doesn't
 * return `null`/`[]` — it *throws*, because the configured project/dataset
 * doesn't exist. The same is true for network failures and GROQ errors
 * against a real project. Every page must still render its fallback content
 * and `pnpm build` must still succeed (including static generation), so
 * this helper catches every fetch-time failure and returns `fallback`
 * instead, logging a warning for visibility. It never throws.
 *
 * When no project id is configured at all we skip the request entirely
 * rather than firing a doomed round-trip per query — that kept `pnpm build`
 * fast and offline-safe, and stopped ~20 identical warnings per build.
 *
 * Once a real Sanity project/dataset exists, `client.fetch` resolves
 * normally and this wrapper is effectively a passthrough.
 */
export async function sanityFetch<TResult, TFallback>(
  query: string,
  params: QueryParams,
  options: { next: { tags: string[] } },
  fallback: TFallback,
): Promise<TResult | TFallback> {
  if (!isSanityConfigured) return fallback

  try {
    return await client.fetch<TResult>(query, params, options)
  } catch (error) {
    console.warn(`[sanityFetch] query failed, using fallback: ${(error as Error).message}`)
    return fallback
  }
}
