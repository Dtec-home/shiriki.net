import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * SERVER-ONLY Sanity write client.
 *
 * Carries `SANITY_API_WRITE_TOKEN` (never a `NEXT_PUBLIC_` var, so it can
 * never leak into the client bundle). Used by the contact/demo-request
 * server actions (Sprint 5) to create `inquiry` documents, and by
 * `scripts/seed.ts`.
 *
 * The token — and possibly the project id — may be unset in local/CI
 * environments. `useCdn` is false because writes must hit the live API.
 */
const writeToken = process.env.SANITY_API_WRITE_TOKEN

export const writeClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
})

/** True only when a real write token is configured. */
export function hasWriteToken(): boolean {
  return Boolean(writeToken && writeToken.trim().length > 0)
}
