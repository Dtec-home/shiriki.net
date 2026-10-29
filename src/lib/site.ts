/**
 * Brand constants. Single source of truth for anything that must resolve
 * even when Sanity is unreachable or unconfigured.
 */
export const SITE_NAME = 'Shiriki'

/**
 * The legal developer of Shiriki: the Google Play developer account the app
 * is published under. Play requires the privacy policy to name the same
 * entity as the store listing, so the policy uses this, not SITE_NAME.
 */
export const DEVELOPER_NAME = 'Allons-y Suite'
export const SITE_TAGLINE = 'Church management that runs on M-Pesa.'
export const SITE_LOCALE = 'en_KE'
export const SITE_LANG = 'en'

/**
 * What Shiriki *is*, as a search phrase. "Shiriki" alone is a common Swahili
 * word shared with other products, so the brand is always paired with this
 * category in titles and structured data — that pairing is what lets a
 * search engine tell this Shiriki apart from the rest.
 */
export const SITE_CATEGORY = 'Church Management System'

export const DEFAULT_TITLE = `${SITE_NAME} ${SITE_CATEGORY} | CFMS & M-Pesa Giving`
export const DEFAULT_DESCRIPTION =
  'Shiriki is a church management system (ChMS) and church funds management system (CFMS) for African churches: M-Pesa, Airtel Money and USSD giving, members, and finance. Web and Android.'

/**
 * Other names people search for Shiriki by. Fed to JSON-LD `alternateName`,
 * which is what Google's site-name and knowledge-panel matching reads.
 */
export const SITE_ALTERNATE_NAMES = [
  'Shiriki Church Management System',
  'Shiriki CFMS',
  'Shiriki ChMS',
  'Shiriki Church',
  'shiriki.site',
]

/**
 * The search terms the site targets. Emitted as `<meta name="keywords">`
 * (read by Bing and others; Google ignores it) and as JSON-LD `keywords`.
 * The words that actually move Google are the ones in titles, headings and
 * body copy — keep these in sync with the copy, not the other way round.
 */
export const SITE_KEYWORDS = [
  'Shiriki',
  'Shiriki church management system',
  'church management system',
  'church management software',
  'ChMS',
  'church CMS',
  'church funds management system',
  'CFMS',
  'church finance software',
  'church accounting software',
  'church giving app',
  'online church giving',
  'M-Pesa church giving',
  'church M-Pesa PayBill reconciliation',
  'USSD church giving',
  'tithe and offering management',
  'church member management',
  'church membership software',
  'church database',
  'church management system Kenya',
  'church software Africa',
  'parish management system',
]

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
export const USSD_CODE = '*710*12414#'

/** The member app on Google Play (package `app.shiriki.mobile`). */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.shiriki.mobile'

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
