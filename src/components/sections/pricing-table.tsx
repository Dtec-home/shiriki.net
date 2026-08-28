import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Badge } from '@/components/ui/badge'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export type PricingTier = {
  name: string
  description: string
  /** KES amount per month, or 'custom' for the Enterprise tier. */
  priceKes: number | 'custom'
  billingNote: string
  features: string[]
  ctaLabel: string
  ctaHref?: string
  highlighted?: boolean
}

export type ComparisonRow = {
  feature: string
  /** One value per tier, in the same order as `tiers`. `true`/`false` render as check/cross. */
  values: (string | boolean)[]
}

export type PricingTableProps = {
  tiers: PricingTier[]
  comparisonRows?: ComparisonRow[]
}

export const FALLBACK_PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    description: 'For small congregations getting off paper and WhatsApp.',
    priceKes: 0,
    billingNote: 'Free, forever, up to 100 members',
    features: [
      'Member directory & profiles',
      'M-Pesa STK Push giving',
      '1 admin login',
      'SMS giving receipts',
      'Community support',
    ],
    ctaLabel: 'Start free',
    ctaHref: '/contact',
  },
  {
    name: 'Growth',
    description: 'For growing churches that need every giving channel and role.',
    priceKes: 4500,
    billingNote: 'per month, up to 1,000 members',
    features: [
      'Everything in Starter',
      'All giving channels (M-Pesa, Airtel Money, card, USSD)',
      '7+ granular admin roles',
      'Events, RSVPs & paid ticketing',
      'SMS, push & email communication hub',
      'Financial reports & audit trail',
    ],
    ctaLabel: 'Request a demo',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For dioceses, networks, and multi-branch churches at scale.',
    priceKes: 'custom',
    billingNote: 'Custom pricing, unlimited members',
    features: [
      'Everything in Growth',
      'Unlimited branches & multi-tenancy',
      'Dedicated onboarding & support',
      'Custom integrations & API access',
      'Service-level agreement (SLA)',
    ],
    ctaLabel: 'Talk to sales',
  },
]

export const FALLBACK_COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Member records & profiles', values: [true, true, true] },
  { feature: 'M-Pesa STK Push giving', values: [true, true, true] },
  { feature: 'M-Pesa PayBill, Airtel Money, card & USSD giving', values: [false, true, true] },
  { feature: 'Admin roles', values: ['1', '7+', 'Unlimited'] },
  { feature: 'Events & paid ticketing', values: [false, true, true] },
  { feature: 'Communication hub (SMS/push/email)', values: [false, true, true] },
  { feature: 'Financial reports & audit trail', values: [false, true, true] },
  { feature: 'Multi-branch / multi-tenancy', values: [false, false, true] },
  { feature: 'Dedicated support & SLA', values: [false, false, true] },
  { feature: 'API access & custom integrations', values: [false, false, true] },
]

function formatPrice(priceKes: PricingTier['priceKes']): string {
  if (priceKes === 'custom') return 'Custom'
  if (priceKes === 0) return 'KES 0'
  return `KES ${priceKes.toLocaleString('en-KE')}`
}

/**
 * Three pricing tier cards plus an optional full feature-comparison table.
 * Used on the pricing page; the middle "Growth" tier is highlighted per the
 * 60/30/10 rule (one primary CTA emphasis per view).
 */
export function PricingTable({ tiers, comparisonRows }: PricingTableProps) {
  return (
    <div className="flex flex-col gap-16">
      <Stagger className="grid items-start gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <StaggerItem key={tier.name}>
            <article
              className={cn(
                'flex h-full flex-col rounded-3xl border p-8',
                tier.highlighted ? 'border-primary bg-primary text-primary-foreground shadow-brand-xl' : 'bg-card shadow-brand-sm',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                {tier.highlighted ? <Badge className="bg-secondary text-secondary-foreground">Most popular</Badge> : null}
              </div>
              <p className={cn('mt-2 text-sm', tier.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                {tier.description}
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight">{formatPrice(tier.priceKes)}</span>
              </div>
              <p className={cn('mt-1 text-sm', tier.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                {tier.billingNote}
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn('flex items-start gap-2 text-sm', tier.highlighted ? 'text-primary-foreground/90' : 'text-muted-foreground')}
                  >
                    <Check
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        tier.highlighted ? 'text-secondary dark:text-primary-foreground' : 'text-primary',
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {tier.ctaHref ? (
                  <TrackEvent
                    event={ANALYTICS_EVENTS.PRICING_PLAN_SELECTED}
                    props={{ tier: tier.name }}
                  >
                    <Link
                      href={tier.ctaHref}
                      className={cn(
                        'inline-flex min-h-11 w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition-colors',
                        tier.highlighted
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:outline-primary-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      {tier.ctaLabel}
                    </Link>
                  </TrackEvent>
                ) : (
                  <DemoRequestDialog>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex min-h-11 w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition-colors',
                        tier.highlighted
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:outline-primary-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      {tier.ctaLabel}
                    </button>
                  </DemoRequestDialog>
                )}
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      {comparisonRows && comparisonRows.length > 0 ? (
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Feature comparison across pricing tiers</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-4 pr-4 font-bold">
                    Feature
                  </th>
                  {tiers.map((tier) => (
                    <th key={tier.name} scope="col" className="px-4 py-4 text-center font-bold">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b last:border-b-0 even:bg-muted/40">
                    <th scope="row" className="py-4 pr-4 font-medium text-foreground">
                      {row.feature}
                    </th>
                    {row.values.map((value, i) => (
                      <td key={`${row.feature}-${tiers[i]?.name ?? i}`} className="px-4 py-4 text-center text-muted-foreground">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="mx-auto size-4 text-primary" aria-label="Included" />
                          ) : (
                            <X className="mx-auto size-4 text-muted-foreground/40" aria-label="Not included" />
                          )
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      ) : null}
    </div>
  )
}
