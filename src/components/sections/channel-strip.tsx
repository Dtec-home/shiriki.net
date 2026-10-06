import { ArrowRight, Building2, CreditCard, Hash, Signal, Smartphone } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PLAY_STORE_URL, USSD_CODE } from '@/lib/site'

/**
 * The narrow strip directly under the hero: one line of news, then the payment
 * rails the product actually speaks to.
 *
 * This is the slot a marketing page usually fills with a wall of customer
 * logos. Shiriki has no customers yet, so a logo wall here would have to be
 * invented — the rails carry the same reassurance honestly, and are the thing
 * a Kenyan church treasurer is actually scanning for. Swap this for real logos
 * only when there are real churches to name.
 */

const CHANNELS = [
  { icon: Smartphone, label: 'M-Pesa STK Push' },
  { icon: Building2, label: 'M-Pesa PayBill' },
  { icon: Signal, label: 'Airtel Money' },
  { icon: Hash, label: `USSD ${USSD_CODE}` },
  { icon: CreditCard, label: 'Cards via Paystack' },
]

export function ChannelStrip() {
  return (
    <section aria-labelledby="channel-strip-heading" className="border-y bg-background py-8">
      <Container size="wide">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm">
          <span className="font-semibold">Shiriki is now on Google Play.</span>
          <span className="text-muted-foreground">
            Members see their giving history, receipts, and church announcements on Android.
          </span>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Get the app
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </p>

        <h2 id="channel-strip-heading" className="sr-only">
          Ways your members can give
        </h2>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {CHANNELS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-muted-foreground">
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-tight">{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
