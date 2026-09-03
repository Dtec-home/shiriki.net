import { ArrowRight, Check } from 'lucide-react'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
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
  /** Highlighted (secondary-colored) portion of the H1. */
  headingHighlight: string
  lead: string
  exploreHref?: string
  exploreLabel?: string
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
  demoLabel: 'Talk to our team',
  trustPoints: ['30-day free trial', 'No payment to start', 'No cut of your offerings'],
}

/**
 * Home page hero: indigo `bg-primary` band with a subtle diagonal-stripe
 * overlay, split into a copy column and `HeroGivingProof` — the STK-prompt
 * illustration that shows the claim the `<h1>` makes.
 *
 * Left-aligned with a plain label rather than the centred-headline-under-a-
 * pill-badge arrangement, which is the most common generated-landing-page
 * layout and reads as one. Hairline rules divide the copy column into bands,
 * echoing the rule in `SectionLabel` so the two read as one system.
 *
 * There is deliberately no rating, customer count, or logo wall here. The
 * product is pre-launch; `trustPoints` carries only facts the pricing page
 * and FAQ can substantiate.
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
  demoLabel = 'Talk to our team',
  trustPoints = FALLBACK_HERO.trustPoints,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,transparent_25%,currentColor_25%,currentColor_26%,transparent_26%,transparent_74%,currentColor_74%,currentColor_75%,transparent_75%)] [background-size:72px_72px]"
      />
      {/* `wide` rather than the site-wide `content`: the copy column and the
          illustration each need room, and a hero is the one place a wider
          measure reads as deliberate rather than inconsistent. */}
      <Container
        size="wide"
        className="relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24"
      >
        <FadeInUp className="flex flex-col">
          {eyebrow ? (
            <SectionLabel className="mb-7 text-secondary dark:text-primary-foreground">{eyebrow}</SectionLabel>
          ) : null}

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
            {headingPrefix}
            <span className="text-secondary dark:text-primary-foreground">{headingHighlight}</span>
          </h1>

          <hr className="mt-8 border-primary-foreground/15" />

          <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-primary-foreground/70">{lead}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:self-start">
            <TrackEvent event={ANALYTICS_EVENTS.CTA_CLICK} props={{ location: 'hero' }}>
              <a
                href={exploreHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-brand-lg transition-all hover:-translate-y-0.5 hover:bg-secondary/90 focus-visible:outline-primary-foreground motion-reduce:transition-none"
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

          {trustPoints && trustPoints.length > 0 ? (
            <>
              <hr className="mt-8 border-primary-foreground/15" />
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Check
                      className="size-4 shrink-0 text-secondary dark:text-primary-foreground"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </FadeInUp>

        <Reveal delay={0.08}>
          <HeroGivingProof />
        </Reveal>
      </Container>
    </section>
  )
}
