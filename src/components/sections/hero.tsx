import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
import { APP_SIGNUP_URL } from '@/lib/site'
import { Container } from '@/components/layout/container'
import { FadeInUp } from '@/components/motion/fade-in-up'
import { Reveal } from '@/components/motion/reveal'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { SectionLabel } from '@/components/sections/section-label'
import { HeroGivingProof } from '@/components/sections/hero-giving-proof'

export type HeroProps = {
  eyebrow?: string
  /** Plain text rendered before the highlighted portion of the H1. */
  headingPrefix: string
  /** Highlighted (primary-colored) portion of the H1. */
  headingHighlight: string
  lead: string
  /** The quiet third link under the two buttons — scrolls, never converts. */
  exploreHref?: string
  exploreLabel?: string
  startLabel?: string
  demoLabel?: string
  /**
   * Short factual reassurances under the CTAs. Every one has to be verifiable
   * against the pricing page and FAQ — this is the slot where a landing page
   * is most tempted to invent a rating or a customer count.
   */
  trustPoints?: string[]
}

export const FALLBACK_HERO: HeroProps = {
  eyebrow: 'Launching 2026',
  headingPrefix: 'Church management that ',
  headingHighlight: 'runs on M-Pesa.',
  lead: 'Members, giving, events, and finance in one system — with STK Push, PayBill, Airtel Money, and USSD gifts that match themselves to your member register.',
  exploreHref: '/#giving',
  exploreLabel: 'See how giving works',
  startLabel: 'Start free',
  demoLabel: 'Talk to our team',
  trustPoints: ['30-day free trial', 'No payment to start', 'No cut of your offerings'],
}

/**
 * Home page hero: a soft teal wash rather than the solid brand band it used to
 * be, split into a copy column and `HeroGivingProof` — the STK-prompt collage
 * that shows the claim the `<h1>` makes instead of restating it.
 *
 * The size contrast between the headline and the lead is the point: an
 * oversized two-tone `<h1>` carries the proposition, and everything under it
 * stays small and quiet. Left-aligned with a plain label rather than the
 * centred-headline-under-a-pill-badge arrangement, which is the most common
 * generated-landing-page layout and reads as one.
 *
 * `Start free` is the primary action and points at the app's signup, so the
 * first button on the page is the one that converts; the scroll anchor is
 * demoted to a text link. There is deliberately no rating, customer count, or
 * logo wall — the product is pre-launch, and `trustPoints` carries only facts
 * the pricing page and FAQ can substantiate.
 *
 * Server Component: the only client boundary is inside `DemoRequestDialog`.
 */
export function Hero({
  eyebrow,
  headingPrefix,
  headingHighlight,
  lead,
  exploreHref = '/#giving',
  exploreLabel = 'See how giving works',
  startLabel = 'Start free',
  demoLabel = 'Talk to our team',
  trustPoints = FALLBACK_HERO.trustPoints,
}: HeroProps) {
  return (
    <section className="hero-wash relative overflow-hidden">
      {/* Retained from the solid-band version: at 3.5% over the wash it is a
          texture you notice only on a large screen, which is the intent. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(135deg,transparent_25%,currentColor_25%,currentColor_26%,transparent_26%,transparent_74%,currentColor_74%,currentColor_75%,transparent_75%)] [background-size:72px_72px]"
      />
      {/* `wide` rather than the site-wide `content`: the copy column and the
          collage each need room, and a hero is the one place a wider measure
          reads as deliberate rather than inconsistent. */}
      <Container
        size="wide"
        className="relative grid items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-24"
      >
        <FadeInUp className="flex flex-col">
          {eyebrow ? <SectionLabel className="mb-6">{eyebrow}</SectionLabel> : null}

          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl xl:text-6xl">
            {headingPrefix}
            <span className="text-primary">{headingHighlight}</span>
          </h1>

          {/* Held well short of the headline's measure. The gap in size between
              the two is what makes the h1 read as the proposition and this as
              the footnote to it. */}
          <p className="mt-6 max-w-md text-pretty leading-7 text-muted-foreground">{lead}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:self-start">
            <TrackEvent event={ANALYTICS_EVENTS.CTA_CLICK} props={{ location: 'hero' }}>
              <Link
                href={APP_SIGNUP_URL}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary py-2 pl-2 pr-6 font-bold text-primary-foreground shadow-brand-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20"
                >
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
                {startLabel}
              </Link>
            </TrackEvent>
            <DemoRequestDialog>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-full border bg-card px-6 py-2 font-semibold text-card-foreground shadow-brand-sm transition-colors hover:bg-muted"
              >
                {demoLabel}
              </button>
            </DemoRequestDialog>
          </div>

          <a
            href={exploreHref}
            className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {exploreLabel}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>

          {trustPoints && trustPoints.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {/* A rotated square, not a check in a circle: at this size the
                      marker only has to separate the items, and three ticks
                      read as a feature list the eye then has to dismiss. */}
                  <span aria-hidden="true" className="size-1.5 rotate-45 rounded-[1px] bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </FadeInUp>

        <Reveal delay={0.08}>
          <HeroGivingProof />
        </Reveal>
      </Container>
    </section>
  )
}
