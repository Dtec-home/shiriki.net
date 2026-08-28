import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/i18n/config'

/** Name of the cookie a future locale switcher would set. Not read/written anywhere yet. */
const LOCALE_COOKIE = 'NEXT_LOCALE'

/**
 * next-intl server config — the foundation piece required by `NextIntlClientProvider`
 * / `useTranslations` once locale routing exists.
 *
 * IMPORTANT: this is not wired into `next.config.js` or any layout yet (see
 * `docs/I18N.md`). Wiring it requires:
 *   1. `next.config.js` wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`.
 *   2. A `middleware.ts` (from `next-intl/middleware`) once routes move under
 *      `app/[locale]/...`.
 *   3. `app/[locale]/layout.tsx` awaiting `params.locale` and rendering
 *      `<NextIntlClientProvider>`.
 *
 * Until that cutover, this function still resolves a best-effort locale from
 * (in order) the `NEXT_LOCALE` cookie, the `Accept-Language` header, then
 * `DEFAULT_LOCALE` — so it behaves correctly the moment it IS wired in,
 * without depending on a `[locale]` route param that doesn't exist yet.
 */
export default getRequestConfig(async () => {
  const locale = await resolveLocale()
  const messages = (await import(`./messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  if (cookieLocale && isSupportedLocale(cookieLocale)) return cookieLocale

  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language')
  const preferred = acceptLanguage
    ?.split(',')
    .map((part) => part.split(';')[0]?.trim().split('-')[0])
    .find((lang): lang is string => Boolean(lang && isSupportedLocale(lang)))

  if (preferred && isSupportedLocale(preferred)) return preferred

  return DEFAULT_LOCALE
}
