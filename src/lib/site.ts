/**
 * Brand constants. Single source of truth for anything that must resolve
 * even when Sanity is unreachable or unconfigured.
 */
export const SITE_NAME = 'Shiriki'
export const SITE_TAGLINE = 'Church operations, beautifully connected.'
export const SITE_LOCALE = 'en_KE'
export const SITE_LANG = 'en'

export const DEFAULT_TITLE = `${SITE_NAME} | Church Management, Connected`
export const DEFAULT_DESCRIPTION =
  'The complete church management platform for African churches — M-Pesa giving, member records, communication, events, and finance in one connected home.'

/**
 * The application, where a church actually signs up and signs in. Separate
 * host from this marketing site: churches are served per-subdomain there
 * (grace.shiriki.site), while this site is the apex.
 */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://app.shiriki.site'
).replace(/\/+$/, '')

/** Where "Get started" sends a church leader — the signup wizard. */
export const APP_SIGNUP_URL = `${APP_URL}/signup`

/** Where "Sign in" sends an existing member or admin. */
export const APP_SIGNIN_URL = `${APP_URL}/login`

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://shiriki.site'
).replace(/\/$/, '')

export const CONTACT_EMAIL = 'hello@shiriki.site'
export const SALES_EMAIL = 'sales@shiriki.site'
export const CONTACT_PHONE = '+254 700 000 000'
export const USSD_CODE = '*710*13414#'

export const ORGANIZATION_ADDRESS = {
  streetAddress: 'Westlands',
  addressLocality: 'Nairobi',
  addressRegion: 'Nairobi',
  postalCode: '00100',
  addressCountry: 'KE',
} as const

export const SOCIAL_LINKS = [
  { platform: 'x', label: 'X', url: 'https://x.com/shiriki' },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/shiriki' },
  { platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/shiriki' },
  { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@shiriki' },
] as const

/** Countries in the primary launch market, for form selectors. */
export const MARKET_COUNTRIES = [
  'Kenya',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Burundi',
  'South Sudan',
  'Ethiopia',
  'Nigeria',
  'Ghana',
  'Zambia',
  'Malawi',
  'South Africa',
  'Other',
] as const
