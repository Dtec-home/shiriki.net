import { ArrowDown, Check, Sparkles } from 'lucide-react'

/**
 * The hero's product collage: an M-Pesa STK prompt and the giving ledger it
 * lands in, already matched to member records. It exists to show the claim the
 * `<h1>` makes rather than restate it.
 *
 * The two cards overlap in a 12-column grid instead of sitting in a stack, so
 * the arrangement itself carries the sequence — the ledger lands across the
 * corner of the prompt. The overlap is a negative margin on the *second* grid
 * row rather than a top offset on the first, which makes it 24px measured from
 * the prompt card's real bottom edge however tall that card grows: it can only
 * ever cover the card's bottom padding, never the Cancel/OK row. Below `lg`
 * the overlap collapses to a plain column with the arrow restored, because at
 * phone width an overlap is just occlusion.
 *
 * The "Matched automatically" pill is the only absolutely positioned element,
 * and it is hidden below `lg`. It is also the only one worth having: a second
 * floating tile beside the prompt card only repeated the M-PESA badge already
 * inside it, and a collage that repeats itself reads as clutter.
 *
 * Every value here is illustrative UI, not a customer: the payee is literally
 * "YOUR CHURCH" and the givers are generic first names. Exposed to assistive
 * tech as a single labelled image so a screen reader gets the meaning instead
 * of a list of invented table cells.
 */

const LEDGER_ROWS = [
  { name: 'Grace W.', amount: 'KES 5,000', category: 'Tithe' },
  { name: 'Joseph O.', amount: 'KES 1,500', category: 'Building fund' },
]

export function HeroGivingProof() {
  return (
    <figure
      role="img"
      aria-label="Illustration: a member approves an M-Pesa STK Push prompt, and the gift appears in the church's giving ledger already matched to their member record."
      className="relative mx-auto w-full max-w-sm lg:max-w-none"
    >
      <div className="flex flex-col items-center gap-3 lg:grid lg:grid-cols-12 lg:items-start lg:gap-0">
        {/* --- The prompt on the member's phone --- */}
        <div
          aria-hidden="true"
          className="w-full rounded-2xl bg-card p-5 text-card-foreground shadow-brand-xl lg:col-start-1 lg:col-end-9 lg:row-start-1"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <span className="rounded-md bg-primary px-2 py-1 font-mono text-[0.65rem] font-bold tracking-wider text-primary-foreground">
              M-PESA
            </span>
            <span className="text-xs text-muted-foreground">STK Push</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Pay</p>
          <p className="text-3xl font-bold tracking-tight">KES 5,000.00</p>
          <p className="mt-1 text-sm text-muted-foreground">
            to <span className="font-semibold text-foreground">YOUR CHURCH</span>
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">M-PESA PIN</span>
            <span className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="size-2 rounded-full bg-foreground/70" />
              ))}
            </span>
          </div>
          <div className="mt-5 flex gap-2">
            <span className="flex-1 rounded-full border py-2.5 text-center text-xs font-semibold text-muted-foreground">
              Cancel
            </span>
            <span className="flex-1 rounded-full bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground">
              OK
            </span>
          </div>
        </div>

        {/* Restores the sequence at phone width, where the cards no longer
            overlap and nothing else says which one comes first. */}
        <ArrowDown aria-hidden="true" className="size-5 shrink-0 text-primary lg:hidden" />

        {/* --- Where it lands, already reconciled --- */}
        <div
          aria-hidden="true"
          className="relative z-10 w-full rounded-2xl bg-card p-5 text-card-foreground shadow-brand-xl lg:col-start-6 lg:col-end-13 lg:row-start-2 lg:-mt-6"
        >
          <span className="absolute -top-3 right-5 hidden items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[0.7rem] font-bold text-primary-foreground shadow-brand-md lg:inline-flex">
            <Sparkles className="size-3" />
            Matched automatically
          </span>
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold">Giving ledger</h3>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <ul className="mt-2 flex flex-col divide-y">
            {LEDGER_ROWS.map((row) => (
              <li key={row.name} className="flex items-center gap-3 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{row.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {row.category} · matched to member
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  )
}
