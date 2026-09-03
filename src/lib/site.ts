/**
 * Brand constants. Single source of truth for anything that must resolve
 * even when Sanity is unreachable or unconfigured.
 */
export const SITE_NAME = 'Shiriki'
export const SITE_TAGLINE = 'Church management that runs on M-Pesa.'
export const SITE_LOCALE = 'en_KE'
export const SITE_LANG = 'en'

export const DEFAULT_TITLE = `${SITE_NAME} | Church management that runs on M-Pesa`
export const DEFAULT_DESCRIPTION =
  'Church management for African congregations: M-Pesa STK Push, PayBill, Airtel Money and USSD giving reconciled against your member register, plus events, communication and finance.'

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
export const CONTACT_PHONE = '+254 797 030 300'
export const USSD_CODE = '*710*13414#'

/**
 * WhatsApp is the same line as `CONTACT_PHONE`, in the digits-only form
 * `wa.me` expects (country code, no `+`, no spaces). Derived rather than
 * written out twice so the two can never drift apart.
 */
export const WHATSAPP_NUMBER = CONTACT_PHONE.replace(/\D/g, '')

/** Pre-filled first message, so the visitor does not start from a blank thread. */
export const WHATSAPP_MESSAGE = "Hi Shiriki — I'd like to know more about using it for my church."

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

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
