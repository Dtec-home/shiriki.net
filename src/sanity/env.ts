export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/**
 * Sanity is optional. When no project id is configured the app must still
 * build and render using hardcoded fallbacks — never throw at import time.
 */
export const isSanityConfigured = Boolean(projectId)

export const studioUrl = '/studio'
