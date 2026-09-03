import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'

export type CtaBandProps = {
  heading: string
  sub?: string
  ctaLabel: string
  /** When provided, the CTA is a plain link (e.g. to /contact). Otherwise it opens the demo dialog. */
  ctaHref?: string
}

export const FALLBACK_CTA_BAND: CtaBandProps = {
  heading: "See it with your own church's numbers.",
  sub: 'Tell us your congregation size and which giving channels you use, and we will walk your team through the setup you would actually run.',
  ctaLabel: 'Request a demo',
}

/**
 * Reusable indigo `bg-primary` closing band — heading + sub on the left, one
 * primary CTA on the right (stacks on mobile). Used at the foot of the home,
 * about, pricing, and FAQ pages.
 */
export function CtaBand({ heading, sub, ctaLabel, ctaHref }: CtaBandProps) {
  return (
    <Reveal>
      <section className="bg-primary py-14 text-primary-foreground md:py-20">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">{heading}</h2>
            {sub ? <p className="max-w-xl text-primary-foreground/70">{sub}</p> : null}
          </div>
          {ctaHref ? (
            <TrackEvent event={ANALYTICS_EVENTS.CTA_CLICK} props={{ location: 'cta-band' }}>
              <Link
                href={ctaHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-brand-lg transition-all hover:-translate-y-0.5 hover:bg-secondary/90 focus-visible:outline-primary-foreground"
              >
                {ctaLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </TrackEvent>
          ) : (
            <DemoRequestDialog>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-brand-lg transition-all hover:-translate-y-0.5 hover:bg-secondary/90 focus-visible:outline-primary-foreground"
              >
                {ctaLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </DemoRequestDialog>
          )}
        </Container>
      </section>
    </Reveal>
  )
}
