/**
 * Option lists for the lead-capture forms, with no zod import.
 *
 * The client forms need only these lists; importing them from
 * `@/lib/contact-schema` pulled zod (~60 KB gzipped) into the bundle every
 * page loads, because the header's demo dialog is on every page (sprint
 * 2026-11 MKQ-3, mobile Lighthouse). `contact-schema` re-exports them, so the
 * server-side rules still use the same lists.
 */

import { MARKET_COUNTRIES } from '@/lib/site'

/** Countries offered in the form's country selector. Matches @/lib/site. */
export const CONTACT_COUNTRIES = MARKET_COUNTRIES

/** Buckets offered in the demo-request congregation-size selector. */
export const CONGREGATION_SIZES = ['<100', '100-500', '500-2000', '2000+'] as const
export type CongregationSize = (typeof CONGREGATION_SIZES)[number]

export const CONGREGATION_SIZE_LABELS: Record<CongregationSize, string> = {
  '<100': 'Under 100 members',
  '100-500': '100 – 500 members',
  '500-2000': '500 – 2,000 members',
  '2000+': 'Over 2,000 members',
}
