import { ArrowDown, Check } from 'lucide-react'

/**
 * The hero's product illustration: an M-Pesa STK prompt, and the giving-ledger
 * rows it lands on already matched to member records. It exists to show the
 * claim the `<h1>` makes rather than restate it.
 *
 * Deliberately two artifacts and a connector, not a scatter of floating glass
 * cards — the arrangement has to read as a sequence (prompt, then ledger),
 * which is the whole point.
 *
 * Every value here is illustrative UI, not a customer: the payee is literally
 * "YOUR CHURCH" and the givers are generic first names. Exposed to assistive
 * tech as a single labelled image so a screen reader gets the meaning instead
 * of a list of fake table cells.
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
      className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 lg:mx-0 lg:max-w-none"
    >
      {/* --- The prompt on the member's phone --- */}
      <div
        aria-hidden="true"
        className="w-full rounded-2xl bg-card p-5 text-card-foreground shadow-brand-xl"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <span className="rounded-md bg-primary px-2 py-1 font-mono text-[0.65rem] font-bold tracking-wider text-primary-foreground">
            M-PESA
          </span>
          <span className="text-xs text-muted-foreground">STK Push</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Pay</p>
        <p className="text-2xl font-bold tracking-tight">KES 5,000.00</p>
        <p className="mt-1 text-sm text-muted-foreground">
          to <span className="font-semibold text-foreground">YOUR CHURCH</span>
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">M-PESA PIN</span>
          <span className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-2 rounded-full bg-foreground/70" />
            ))}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="flex-1 rounded-lg border py-2 text-center text-xs font-semibold text-muted-foreground">
            Cancel
          </span>
          <span className="flex-1 rounded-lg bg-primary py-2 text-center text-xs font-bold text-primary-foreground">
            OK
          </span>
        </div>
      </div>

      <ArrowDown aria-hidden="true" className="size-5 shrink-0 text-primary-foreground/50" />

      {/* --- Where it lands, already reconciled --- */}
      <div
        aria-hidden="true"
        className="w-full rounded-2xl bg-card p-5 text-card-foreground shadow-brand-xl"
      >
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
    </figure>
  )
}
