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

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Simple, KES-priced plans for churches of every size — from a free starter tier to enterprise multi-branch deployments.',
  path: '/pricing',
})

const PRICING_FAQ = [
  {
    question: 'Is there really a free plan?',
    answer:
      'Yes. Starter is free forever for congregations up to 100 members, with M-Pesa STK Push giving and a member directory included — no credit card required.',
  },
  {
    question: 'How is the Growth plan billed?',
    answer:
      'Growth is billed monthly in Kenyan Shillings via M-Pesa or card. There is no long-term contract — you can upgrade, downgrade, or cancel at the end of any billing month.',
  },
  {
    question: 'Do you charge a percentage on M-Pesa giving?',
    answer:
      "We don't add a markup on top of Safaricom's standard M-Pesa transaction charges. Your church keeps the full contribution amount, minus only the standard telco fee.",
  },
  {
    question: "What happens if we outgrow the Growth plan's member limit?",
    answer:
      "We'll reach out before you hit the limit to discuss moving to Enterprise. Your data, giving history, and configuration carry over with no downtime.",
  },
  {
    question: 'Is Enterprise pricing negotiable for dioceses or church networks?',
    answer:
      'Yes. Enterprise pricing is quoted per branch/campus and scales with the number of member churches, admin seats, and support needs. Talk to our sales team for a tailored quote.',
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
    'Every plan includes M-Pesa STK Push giving, member records, and bank-grade security. Upgrade as your congregation grows — no surprises, no hidden fees.'

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
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Pricing</span>
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
