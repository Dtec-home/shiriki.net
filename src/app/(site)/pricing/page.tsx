import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { PricingTable, FALLBACK_PRICING_TIERS, FALLBACK_COMPARISON_ROWS } from '@/components/sections/pricing-table'
import { CtaBand } from '@/components/sections/cta-band'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { buildMetadata } from '@/lib/metadata'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pricingPageQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'
import { SectionLabel } from '@/components/sections/section-label'

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Simple, KES-priced plans for churches of every size — start with a 30-day free trial, then from KES 2,000/mo to custom enterprise deployments.',
  path: '/pricing',
})

const PRICING_FAQ = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes. Every church starts with a 30-day free trial on the Msingi plan — M-Pesa STK Push giving, USSD giving, a member directory, attendance tracking, and 100 SMS included. No M-Pesa payment or credit card required to start.',
  },
  {
    question: 'What happens after the free trial?',
    answer:
      'After 30 days your church moves to the Msingi paid plan at KES 2,000/month. You can upgrade to Ukuaji or Kanisa at any time. All your data, giving history, and member records carry over — nothing is lost.',
  },
  {
    question: 'How do we pay for Shiriki?',
    answer:
      'Plans are billed monthly in Kenyan Shillings via M-Pesa or card. Pay annually and save — 10 months\' price covers the full year. No long-term contracts — upgrade, downgrade, or cancel at the end of any billing month.',
  },
  {
    question: 'Do you charge a percentage on M-Pesa giving?',
    answer:
      "We never add a markup on top of Safaricom's or Airtel's standard mobile money charges. Your church keeps 100% of every contribution, minus only the telco's standard transaction fee.",
  },
  {
    question: 'What about SMS costs?',
    answer:
      'Every plan includes a monthly SMS allocation — 100 for Msingi, 200 for Ukuaji, 500 for Kanisa. Need more? Top up at KES 0.70–0.80 per SMS depending on your plan.',
  },
  {
    question: "What happens if we outgrow our plan's member limit?",
    answer:
      "We'll notify you as you approach your limit. Upgrading is instant — your data, giving history, and configuration carry over with zero downtime.",
  },
  {
    question: 'Can a diocese put all its branches on one bill?',
    answer:
      'Yes. Shirikisho includes consolidated billing for all branches under one organisation, with a single monthly invoice. Pricing is quoted per branch and scales with the number of member churches.',
  },
]

type PricingPlanDoc = {
  name: string
  priceKES?: number | null
  period?: string | null
  description?: string | null
  features?: string[] | null
  highlighted?: boolean | null
  ctaLabel?: string | null
}

type PricingPageDoc = {
  heading?: string | null
  intro?: string | null
  plans?: PricingPlanDoc[] | null
  comparisonNote?: string | null
} | null

export default async function PricingPage() {
  const pricingPage = await sanityFetch<PricingPageDoc, PricingPageDoc>(
    pricingPageQuery,
    {},
    { next: { tags: [typeTag('pricingPage')] } },
    null,
  )
  const heading = pricingPage?.heading || 'Priced in KES, built for churches of every size.'
  const intro =
    pricingPage?.intro ||
    'Start with a 30-day free trial. Every plan includes M-Pesa giving and member records. Upgrade as your congregation grows — no setup fee, and no percentage taken off your offerings.'

  const tiers =
    pricingPage?.plans && pricingPage.plans.length > 0
      ? pricingPage.plans.map((plan) => ({
          name: plan.name,
          description: plan.description || '',
          priceKes: (plan.period === 'custom' || plan.priceKES == null ? 'custom' : plan.priceKES) as number | 'custom',
          billingNote: plan.period === 'custom' ? 'Custom pricing' : plan.period === 'year' ? 'per year' : 'per month',
          features: plan.features ?? [],
          ctaLabel: plan.ctaLabel || 'Get started',
          highlighted: Boolean(plan.highlighted),
        }))
      : FALLBACK_PRICING_TIERS

  return (
    <>
      <Container as="div" className="flex flex-col gap-16 py-16 md:py-24">
        <Reveal className="flex flex-col gap-5">
          <SectionLabel className="text-primary">Pricing</SectionLabel>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">{heading}</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p>
        </Reveal>

        <div className="flex flex-col gap-4">
          <PricingTable tiers={tiers} comparisonRows={FALLBACK_COMPARISON_ROWS} />
          {pricingPage?.comparisonNote ? <p className="text-sm text-muted-foreground">{pricingPage.comparisonNote}</p> : null}
        </div>

        <div className="flex flex-col gap-6">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Pricing questions</h2>
          </Reveal>
          <Reveal className="max-w-[720px]">
            <Accordion>
              {PRICING_FAQ.map((item, i) => (
                <AccordionItem key={item.question} value={`pricing-faq-${i}`}>
                  <AccordionTrigger className="text-base font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="max-w-[640px] leading-7 text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Container>

      <CtaBand
        heading="Not sure which plan fits your church?"
        sub="Tell us your congregation size and giving channels, and we'll recommend a plan."
        ctaLabel="Talk to sales"
      />
    </>
  )
}
