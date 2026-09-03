import { CheckCircle2, CreditCard } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { FadeInUp } from '@/components/motion/fade-in-up'
import { Reveal } from '@/components/motion/reveal'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { SectionLabel } from '@/components/sections/section-label'

export type GivingCartLine = {
  label: string
  amount: string
}

export type GivingChannelsProps = {
  eyebrow: string
  heading: string
  lead: string
  channels: string[]
  cart: {
    kicker: string
    title: string
    lines: GivingCartLine[]
    totalLabel: string
    total: string
    ctaLabel: string
  }
}

export const FALLBACK_GIVING_CHANNELS: GivingChannelsProps = {
  eyebrow: 'Giving channels',
  heading: 'Every gift lands in the same ledger.',
  lead: 'Five ways to give, one reconciled record. A payment that cannot be matched to a member is held for an admin to resolve — never rejected, never lost.',
  channels: [
    "M-Pesa STK Push — the prompt arrives on the member's phone",
    'M-Pesa PayBill — matched by phone number and account reference',
    'Airtel Money — for members on the Airtel network',
    'Card via Paystack — for diaspora members giving in KES',
    'USSD (*710*13414#) — no smartphone, no data bundle',
  ],
  cart: {
    kicker: 'Sunday giving',
    title: 'Multi-category cart',
    lines: [
      { label: 'Tithe', amount: 'KES 5,000' },
      { label: 'Youth Tour Fund', amount: 'KES 1,500' },
    ],
    totalLabel: 'Total contribution',
    total: 'KES 6,500',
    ctaLabel: 'Send STK prompt',
  },
}

/**
 * Giving section: the five channel list on the left, a multi-category giving
 * cart card on the right. Anchored as `#giving` for the main nav's "Giving"
 * link.
 */
export function GivingChannels({ eyebrow, heading, lead, channels, cart }: GivingChannelsProps) {
  return (
    <section id="giving" className="scroll-mt-20 bg-primary/5 py-20 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <FadeInUp>
          <SectionLabel className="text-primary">{eyebrow}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{lead}</p>
          <ul className="mt-8 flex flex-col gap-4">
            {channels.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FadeInUp>

        <Reveal delay={0.08}>
          <div className="rounded-3xl border bg-card p-6 shadow-brand-xl md:p-8">
            <div className="flex items-center justify-between border-b pb-5">
              <div>
                <p className="text-sm text-muted-foreground">{cart.kicker}</p>
                <h3 className="mt-1 text-xl font-bold">{cart.title}</h3>
              </div>
              <CreditCard className="text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-3 py-6">
              {cart.lines.map((line) => (
                <div key={line.label} className="flex justify-between rounded-xl bg-muted/60 p-4">
                  <span>{line.label}</span>
                  <span className="font-semibold">{line.amount}</span>
                </div>
              ))}
              <div className="flex justify-between rounded-xl bg-primary p-4 font-bold text-primary-foreground">
                <span>{cart.totalLabel}</span>
                <span>{cart.total}</span>
              </div>
            </div>
            <DemoRequestDialog>
              <button
                type="button"
                className="min-h-11 w-full rounded-lg bg-secondary py-3 font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
              >
                {cart.ctaLabel}
              </button>
            </DemoRequestDialog>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
