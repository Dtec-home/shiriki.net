/**
 * Brand constants. Single source of truth for anything that must resolve
 * even when Sanity is unreachable or unconfigured.
 */
export const SITE_NAME = 'Kanisa Connect'
export const SITE_TAGLINE = 'Church operations, beautifully connected.'
export const SITE_LOCALE = 'en_KE'
export const SITE_LANG = 'en'

export const DEFAULT_TITLE = `${SITE_NAME} | Church Management, Connected`
export const DEFAULT_DESCRIPTION =
  'The complete church management platform for African churches — M-Pesa giving, member records, communication, events, and finance in one connected home.'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kanisaconnect.com'
).replace(/\/$/, '')

export const CONTACT_EMAIL = 'hello@kanisaconnect.com'
export const SALES_EMAIL = 'sales@kanisaconnect.com'
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
  { platform: 'x', label: 'X', url: 'https://x.com/kanisaconnect' },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/kanisaconnect' },
  { platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/kanisaconnect' },
  { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@kanisaconnect' },
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
