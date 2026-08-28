import { ArrowRight } from 'lucide-react'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
import { Container } from '@/components/layout/container'
import { FadeInUp } from '@/components/motion/fade-in-up'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'

export type HeroProps = {
  eyebrow?: string
  /** Plain text rendered before the highlighted portion of the H1. */
  headingPrefix: string
  /** Highlighted (secondary-colored) portion of the H1. */
  headingHighlight: string
  lead: string
  exploreHref?: string
  exploreLabel?: string
  demoLabel?: string
}

export const FALLBACK_HERO: HeroProps = {
  eyebrow: 'Launch 2026',
  headingPrefix: 'Church operations, ',
  headingHighlight: 'beautifully connected.',
  lead: 'Giving. Members. Communication. All connected. A complete management platform built for African churches.',
  exploreHref: '/#giving',
  exploreLabel: 'Explore platform',
  demoLabel: 'Talk to our team',
}

/**
 * Home page hero: indigo `bg-primary` band with a subtle diagonal-stripe
 * overlay, an eyebrow pill, the page's single `<h1>`, a lead paragraph, and
 * two CTAs — an anchor link into the giving section, and the demo dialog.
 * Server Component: the only client boundary is inside `DemoRequestDialog`.
 */
export function Hero({
  eyebrow,
  headingPrefix,
  headingHighlight,
  lead,
  exploreHref = '/#giving',
  exploreLabel = 'Explore platform',
  demoLabel = 'Talk to our team',
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,transparent_25%,currentColor_25%,currentColor_26%,transparent_26%,transparent_74%,currentColor_74%,currentColor_75%,transparent_75%)] [background-size:72px_72px]"
      />
      <Container size="content" className="relative flex flex-col items-center py-16 text-center lg:py-24">
        <FadeInUp className="flex flex-col items-center">
          {eyebrow ? (
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary dark:text-primary-foreground">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl">
            {headingPrefix}
            <span className="text-secondary dark:text-primary-foreground">{headingHighlight}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-primary-foreground/70 md:text-xl">
            {lead}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <TrackEvent event={ANALYTICS_EVENTS.CTA_CLICK} props={{ location: 'hero' }}>
              <a
                href={exploreHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-brand-lg transition-all hover:-translate-y-0.5 hover:bg-secondary/90 focus-visible:outline-primary-foreground"
              >
                {exploreLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </TrackEvent>
            <DemoRequestDialog>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary-foreground/20 px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-primary-foreground"
              >
                {demoLabel}
              </button>
            </DemoRequestDialog>
          </div>
        </FadeInUp>
      </Container>
    </section>
  )
}
