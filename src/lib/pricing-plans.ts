/**
 * Plan content shared by the pricing page's built-in fallback (rendered when
 * no Sanity project is configured, and always for the comparison table) and
 * `scripts/seed.ts` (what Sanity is seeded with). One source, so the two
 * cannot drift; `scripts/seed.test.ts` checks they agree.
 *
 * `PLAN_FLAG_BULLETS` is the plan bullet for each feature flag added in
 * sprint 2026-11 (decision P-D3), on the cheapest plan that includes the flag
 * in the backend's `tenants/plans.py`. Higher plans include it too
 * ("Everything in ..."), so it is listed once. Keyed by flag name so a
 * contract test can compare it with `plans.py`.
 *
 * Data only: no React, no server-only imports, so plain Node can read it.
 */

export const PLAN_NAMES = ['Msingi', 'Ukuaji', 'Kanisa', 'Shirikisho'] as const
export type PlanName = (typeof PLAN_NAMES)[number]

export const PLAN_FLAG_BULLETS = {
  device_sign_in: { plan: 'Msingi', bullet: 'Fingerprint sign-in on the member app' },
  giving_campaigns: { plan: 'Ukuaji', bullet: 'Fundraising campaigns with public pages' },
  campaign_public_pages: { plan: 'Ukuaji', bullet: 'Fundraising campaigns with public pages' },
  pledge_module: { plan: 'Ukuaji', bullet: 'Pledges that clear themselves as money arrives' },
  fundraising_champions: { plan: 'Ukuaji', bullet: 'Fundraising champions with personal codes' },
  department_campaigns: { plan: 'Ukuaji', bullet: 'Department-backed campaigns, history included' },
  whatsapp_leaderboard: { plan: 'Kanisa', bullet: 'Automatic WhatsApp group leaderboard' },
} as const satisfies Record<string, { plan: PlanName; bullet: string }>

/** The sprint bullets a plan adds, de-duplicated, in declaration order. */
export function planBullets(plan: PlanName): string[] {
  const bullets: string[] = []
  for (const entry of Object.values(PLAN_FLAG_BULLETS)) {
    if (entry.plan === plan && !bullets.includes(entry.bullet)) bullets.push(entry.bullet)
  }
  return bullets
}

/** One comparison row per sprint bullet, ticked from its first plan upwards. */
function comparisonRowsForSprintBullets(): ComparisonRow[] {
  return PLAN_NAMES.flatMap((plan) =>
    planBullets(plan).map((bullet) => ({
      feature: bullet,
      values: PLAN_NAMES.map((_, i) => i >= PLAN_NAMES.indexOf(plan)),
    })),
  )
}

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

export const FALLBACK_PRICING_TIERS: PricingTier[] = [
  {
    name: 'Msingi',
    description: 'For small congregations getting off paper and WhatsApp. Start with a 30-day free trial.',
    priceKes: 2000,
    billingNote: '30-day free trial, then KES 2,000/mo · up to 150 members',
    features: [
      'Member directory & profiles',
      'M-Pesa STK Push & USSD giving',
      '100 SMS/month included',
      'Basic attendance tracking',
      '1 admin login',
      ...planBullets('Msingi'),
      'Community support',
    ],
    ctaLabel: 'Start free trial',
    ctaHref: '/contact',
  },
  {
    name: 'Ukuaji',
    description: 'For growing churches that need every giving channel, multiple roles, and proper reconciliation.',
    priceKes: 3500,
    billingNote: 'per month · up to 500 members',
    features: [
      'Everything in Msingi',
      'All giving channels (M-Pesa, Airtel Money, card, USSD)',
      ...planBullets('Ukuaji'),
      'Up to 5 admin roles',
      'Events & RSVPs',
      '200 SMS/month included',
      'Email notifications',
      'Financial reports & audit trail',
    ],
    ctaLabel: 'Request a demo',
    highlighted: true,
  },
  {
    name: 'Kanisa',
    description: 'For established churches with staff, finance operations, and up to 3 branches.',
    priceKes: 7500,
    billingNote: 'per month · up to 2,000 members',
    features: [
      'Everything in Ukuaji',
      'Unlimited admin roles',
      'Double-entry accounting & budgets',
      'HR, leave & Kenyan payroll (PAYE/NSSF/SHIF)',
      'Paid event ticketing & YouTube sync',
      ...planBullets('Kanisa'),
      '500 SMS/month included',
      'Up to 3 branches',
    ],
    ctaLabel: 'Request a demo',
  },
  {
    name: 'Shirikisho',
    description: 'For dioceses, conferences, and multi-branch churches at scale.',
    priceKes: 'custom',
    billingNote: 'Custom pricing · unlimited members & branches',
    features: [
      'Everything in Kanisa',
      'Unlimited branches & multi-tenancy',
      'Consolidated financial reporting',
      'Custom domain & API access',
      'Dedicated account manager & SLA',
    ],
    ctaLabel: 'Talk to sales',
  },
]

export const FALLBACK_COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Member records & profiles', values: ['Up to 150', 'Up to 500', 'Up to 2,000', 'Unlimited'] },
  { feature: 'M-Pesa STK Push & USSD giving', values: [true, true, true, true] },
  { feature: 'M-Pesa PayBill & Airtel Money', values: [false, true, true, true] },
  { feature: 'Card payments (Visa/Mastercard)', values: [false, true, true, true] },
  { feature: 'Admin roles', values: ['1', '5', 'Unlimited', 'Unlimited'] },
  { feature: 'Bulk SMS included', values: ['100/mo', '200/mo', '500/mo', 'Custom'] },
  { feature: 'Events & RSVPs', values: [false, true, true, true] },
  { feature: 'Paid event ticketing', values: [false, false, true, true] },
  ...comparisonRowsForSprintBullets(),
  { feature: 'Financial reports & audit trail', values: [false, true, true, true] },
  { feature: 'Double-entry accounting & budgets', values: [false, false, true, true] },
  { feature: 'HR, leave & Kenyan payroll', values: [false, false, true, true] },
  { feature: 'Multi-branch / multi-tenancy', values: [false, false, 'Up to 3', 'Unlimited'] },
  { feature: 'Custom domain', values: [false, false, false, true] },
  { feature: 'Dedicated support & SLA', values: ['Community', 'Priority', 'Priority + onboarding', 'Dedicated manager'] },
  { feature: 'API access & custom integrations', values: [false, false, false, true] },
]
