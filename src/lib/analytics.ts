/**
 * Typed analytics wrapper over `@vercel/analytics`'s `track()`.
 *
 * ## Conversion funnel this catalogue is built to measure
 *
 *   Landing (page_view, auto-tracked by <Analytics/> in app/layout.tsx)
 *     -> CTA click (cta_click) on a hero / pricing / nav / footer link
 *     -> Demo dialog opened (demo_dialog_opened)
 *     -> Demo form submitted (demo_request_submitted)
 *     -> Success state shown in the dialog (demo_request_succeeded)
 *
 * A parallel, shorter funnel exists for the general contact form:
 *   contact_form_submitted -> contact_form_succeeded
 *
 * Secondary, non-linear engagement signals feed the same funnel analysis:
 * giving-channel interaction, USSD simulator interaction, pricing-plan
 * selection, nav/footer link clicks, and scroll depth (25/50/75/100%).
 *
 * ## Design constraints
 * - No-op outside production (`NODE_ENV !== 'production'`), matching the
 *   root layout's `{process.env.NODE_ENV === 'production' && <Analytics />}`
 *   gate — calling `trackEvent` when the script was never injected must not
 *   throw, and doing real work in dev is pure noise.
 * - Server-safe: every call is guarded with `typeof window`, so importing or
 *   calling this from a Server Component / Server Action never breaks the
 *   build. (Server Actions should still prefer their own logging — this
 *   module exists to be called from Client Components.)
 * - Never throws: analytics must never be the reason a click handler,
 *   navigation, or form submission fails. Blocked scripts (ad-blockers,
 *   browser extensions), Do Not Track, and any unexpected runtime error are
 *   all swallowed silently.
 */
import { track } from '@vercel/analytics'

/**
 * The full analytics event catalogue. Call sites reference `ANALYTICS_EVENTS.X`
 * instead of a string literal so a typo fails at compile time, not in the
 * Vercel Analytics dashboard.
 */
export const ANALYTICS_EVENTS = {
  // --- CTA / navigation ---------------------------------------------------
  /** Any primary/secondary CTA button or link click (hero, pricing, CTA band, etc). */
  CTA_CLICK: 'cta_click',
  /** A link inside the main header nav or mobile nav drawer was clicked. */
  NAV_LINK_CLICK: 'nav_link_click',
  /** A link inside a footer column was clicked. */
  FOOTER_LINK_CLICK: 'footer_link_click',

  // --- Demo request funnel -------------------------------------------------
  /** The "Request demo" dialog was opened, from any trigger. */
  DEMO_DIALOG_OPENED: 'demo_dialog_opened',
  /** The demo-request form was submitted (client-side, before the server responds). */
  DEMO_REQUEST_SUBMITTED: 'demo_request_submitted',
  /** The server action returned success and the dialog shows its confirmation state. */
  DEMO_REQUEST_SUCCEEDED: 'demo_request_succeeded',
  /** The server action returned a validation or server error. */
  DEMO_REQUEST_FAILED: 'demo_request_failed',

  // --- Contact form funnel --------------------------------------------------
  /** The general contact form was submitted (client-side, before the server responds). */
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
  /** The contact server action returned success. */
  CONTACT_FORM_SUCCEEDED: 'contact_form_succeeded',
  /** The contact server action returned a validation or server error. */
  CONTACT_FORM_FAILED: 'contact_form_failed',

  // --- Product engagement ---------------------------------------------------
  /** A visitor interacted with a giving-channel entry (e.g. expanded/selected M-Pesa, Airtel Money, card, USSD). */
  GIVING_CHANNEL_INTERACTION: 'giving_channel_interaction',
  /** A visitor interacted with the USSD simulator/demo widget. */
  USSD_SIMULATOR_INTERACTION: 'ussd_simulator_interaction',
  /** A pricing plan's CTA was chosen (Starter / Growth / Enterprise). */
  PRICING_PLAN_SELECTED: 'pricing_plan_selected',
  /** The floating WhatsApp button was clicked, opening a chat thread. */
  WHATSAPP_CLICK: 'whatsapp_click',

  // --- Engagement depth ------------------------------------------------------
  /** Fired once per milestone (25/50/75/100) the first time a page scroll crosses it. */
  SCROLL_DEPTH: 'scroll_depth',
} as const

/** Union of every valid event name — `trackEvent`'s first parameter is typed to this. */
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

/** Allowed property value types, matching what `@vercel/analytics` accepts. */
export type AnalyticsEventProps = Record<string, string | number | boolean | null | undefined>

/**
 * Fire a typed analytics event. No-op outside production, server-safe, and
 * guaranteed never to throw — call it freely from event handlers without a
 * surrounding try/catch.
 *
 * @param name  One of `ANALYTICS_EVENTS`'s values (use the const, not a raw string).
 * @param props Optional flat property bag (nested objects are not supported
 *              by Vercel Analytics — keep values primitive).
 */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProps): void {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'production') return

  try {
    track(name, props)
  } catch {
    // Analytics must never break the UI: blocked scripts, ad-blockers,
    // Do Not Track configurations, or an unavailable `window.va` queue are
    // all expected and silently ignored.
  }
}
