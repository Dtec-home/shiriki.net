/**
 * i18n locale configuration — the foundation for Sprint 7's localization
 * work. See `docs/I18N.md` for the full cutover plan: this sprint delivers
 * config + message catalogs, NOT live locale-prefixed routing (that would
 * restructure every route under `app/[locale]/…`, which is out of scope
 * while a concurrent agent owns `src/app/(site)/**`).
 */

/** Supported locales, in the order they should appear in any locale switcher UI. */
export const LOCALES = ['en', 'sw', 'fr'] as const

export type Locale = (typeof LOCALES)[number]

/** The locale served when no other locale is requested/resolved. */
export const DEFAULT_LOCALE: Locale = 'en'

/** Human-readable label for each locale, in its own language (for a locale switcher). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
  fr: 'Français',
}

/** All three supported locales read left-to-right — no RTL handling is needed yet. */
export const RTL_LOCALES: readonly Locale[] = []

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function isSupportedLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
