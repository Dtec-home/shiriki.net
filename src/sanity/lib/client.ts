import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * Default read client for published content.
 *
 * `projectId` may be an empty string when Sanity is not configured (see
 * `src/sanity/env.ts`). `createClient` must not throw at *construction*
 * time in that case — only fetches should ever fail, and every fetch in
 * this app goes through `sanityFetch` (see `./fetch.ts`), which catches
 * that failure and returns the caller's typed fallback. We substitute a
 * syntactically valid placeholder project id so the client object is
 * always constructible; it will simply never resolve real data until a
 * project id is configured.
 */
export const client = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
