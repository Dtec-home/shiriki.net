import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
import { WHATSAPP_URL } from '@/lib/site'

/**
 * WhatsApp's glyph. lucide dropped brand marks, so it is inlined here rather
 * than pulling in a second icon package for one path.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.898 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.465 3.49" />
    </svg>
  )
}

/**
 * Floating WhatsApp button, pinned bottom-right on every `(site)` route.
 *
 * Opens `wa.me` with the number and a pre-filled message from `@/lib/site`.
 * Kept below the skip-to-content link in the stacking order (`z-40` vs
 * `z-[100]`) so keyboard users still land on the skip link first, and it sits
 * in the DOM after `<main>` so it is late in the tab order rather than
 * interrupting the page.
 *
 * Server Component — `TrackEvent` is the only client boundary.
 */
export function WhatsAppButton() {
  return (
    <TrackEvent event={ANALYTICS_EVENTS.WHATSAPP_CLICK} props={{ location: 'floating' }}>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (opens in a new tab)"
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-brand-lg transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] motion-reduce:transition-none sm:bottom-6 sm:right-6"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </TrackEvent>
  )
}
