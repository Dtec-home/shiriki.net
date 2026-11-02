import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Badge } from '@/components/ui/badge'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { TrackEvent } from '@/components/analytics/track-event'
import { ANALYTICS_EVENTS } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export type { ComparisonRow, PricingTier } from '@/lib/pricing-plans'
export { FALLBACK_COMPARISON_ROWS, FALLBACK_PRICING_TIERS } from '@/lib/pricing-plans'
import type { ComparisonRow, PricingTier } from '@/lib/pricing-plans'

export type PricingTableProps = {
  tiers: PricingTier[]
  comparisonRows?: ComparisonRow[]
}

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
      <Stagger className="grid items-start gap-6 lg:grid-cols-4">
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
