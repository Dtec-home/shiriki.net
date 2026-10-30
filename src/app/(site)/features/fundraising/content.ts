/**
 * Built-in copy for the fundraising feature page (/features/fundraising).
 *
 * One source for the page, its OG image, the JSON-LD feature list and the
 * llms.txt / llms-full.txt routes, so the AEO summaries can never drift from
 * what the page says. The page overlays the Sanity `feature` document
 * `feature-fundraising-campaigns` (seeded by scripts/seed.ts) on top of this
 * when Sanity is configured; with no Sanity project, this is what renders.
 *
 * Plan rows mirror the sprint's confirmed tiers (P-D3) and must stay identical
 * to `tenants/plans.py` and the pricing bullets: the site is a promise.
 */

export const FUNDRAISING_PATH = '/features/fundraising'

/** Deterministic id of the Sanity `feature` document this page overlays. */
export const FUNDRAISING_FEATURE_ID = 'feature-fundraising-campaigns'

export const FUNDRAISING_TITLE = 'Fundraising campaigns'

export const FUNDRAISING_HEADING = 'Run every harambee and building drive on the books you already keep.'

export const FUNDRAISING_SUMMARY =
  'Fundraising campaigns in Shiriki: a Pay Bill code per drive, pledges that clear themselves as money arrives, champions with their own codes, a public campaign page that shows totals only, an automatic WhatsApp group leaderboard, and a campaign statement for close-out — all on the church’s own Pay Bill and ledger, with no platform fee on gifts.'

export const FUNDRAISING_BULLETS = [
  'A Pay Bill account code for every campaign',
  'Pledges that clear themselves as money arrives',
  'Champions who raise from their own networks',
  'A campaign statement the board can audit',
]

export type FundraisingChannel = { title: string; text: string; example?: string }

export const FUNDRAISING_CHANNELS: FundraisingChannel[] = [
  {
    title: 'Pay Bill with the campaign code',
    text: 'Givers use your church’s existing Pay Bill and type the campaign code as the account number. Add a champion’s code after it and the gift counts for that champion too.',
    example: 'BUILD · BUILD JOHN',
  },
  {
    title: 'M-Pesa prompt from the campaign page',
    text: 'A visitor opens the shared link, enters an amount and confirms the M-Pesa prompt on their phone. No account needed.',
  },
  {
    title: 'USSD on any phone',
    text: 'Members on feature phones choose the campaign from the USSD menu and give without data or an app.',
  },
  {
    title: 'Cash and envelopes at the desk',
    text: 'The desk volunteer tags a cash or envelope gift to the campaign, with a champion code if there is one, so desk money counts like Pay Bill money.',
  },
]

export type FundraisingCapability = { icon: string; title: string; text: string }

export const FUNDRAISING_CAPABILITIES: FundraisingCapability[] = [
  {
    icon: 'handshake',
    title: 'Pledges that clear themselves',
    text: 'Members and guests pledge an amount and a due date. Each gift clears the oldest open pledge first, and only money given after the pledge counts towards it, so balances are right without anyone reconciling by hand. Members see what they still owe.',
  },
  {
    icon: 'megaphone',
    title: 'Champions',
    text: 'Invite trusted members to raise from their own networks. Each champion gets a personal code, a dashboard of the gifts that came through them and a place on the campaign leaderboard.',
  },
  {
    icon: 'globe',
    title: 'Public campaign page',
    text: 'Every campaign gets a page on your church’s own web address with progress, the number of givers, days left and your updates. It shows totals only, never a giver’s name or amount, and link previews always show today’s figure.',
  },
  {
    icon: 'file-text',
    title: 'Campaign statement and close-out',
    text: 'One statement shows what came in by channel, the expenses and payouts charged to the campaign, and what is left. Close the campaign with a record the board and auditors can read.',
  },
  {
    icon: 'layers',
    title: 'Department-backed campaigns',
    text: 'A campaign can count every gift to its department, history included, whatever code the giver used, so the drive’s total is the department’s total.',
  },
  {
    icon: 'shield-check',
    title: 'Four-eyes approval',
    text: 'The person who creates a campaign cannot approve it; a pastor or admin must. Changing what counts towards a live campaign needs a second approver too, and every step is written to the audit log.',
  },
]

export const FUNDRAISING_WHATSAPP = {
  title: 'Automatic WhatsApp group leaderboard',
  text: 'Link your church’s WhatsApp number once by scanning a QR code. After gifts come in, Shiriki posts an updated leaderboard to the campaign’s WhatsApp group from your own number, batched about a minute at a time so the group is not flooded. Nobody posts lists by hand.',
  points: [
    'Your church chooses how givers appear: full name, first name and initial, or totals only',
    'Any member can ask to be listed as a well-wisher instead of by name',
    'Delivery status for every post in the admin',
  ],
}

export const FUNDRAISING_DEVICE_SIGN_IN = {
  title: 'Fingerprint sign-in on mobile',
  text: 'Members sign in to the Android app with their fingerprint, backed by a key stored in the phone’s secure hardware, so a weekly visit does not cost an SMS code. The app locks after five minutes away and hides amounts in the app switcher.',
}

export const FUNDRAISING_SMS_NOTE =
  'Donor updates, pledge reminders and champion digests are sent from your church’s SMS credits. Scheduled reminders stay off until your church switches them on.'

export type FundraisingPlanRow = {
  /** Stable key, used as `data-plan` for tests and by the pricing contract. */
  key: string
  capability: string
  plan: string
}

export const FUNDRAISING_PLAN_ROWS: FundraisingPlanRow[] = [
  { key: 'giving-campaigns', capability: 'Fundraising campaigns with Pay Bill codes', plan: 'Ukuaji and above' },
  { key: 'pledges', capability: 'Pledges, reminders and the pledge register', plan: 'Ukuaji and above' },
  { key: 'champions', capability: 'Champions with personal codes', plan: 'Ukuaji and above' },
  { key: 'department-campaigns', capability: 'Department-backed campaigns', plan: 'Ukuaji and above' },
  { key: 'public-pages', capability: 'Public campaign pages', plan: 'Ukuaji and above' },
  { key: 'whatsapp-leaderboard', capability: 'Automatic WhatsApp group leaderboard', plan: 'Kanisa and above' },
  { key: 'device-sign-in', capability: 'Fingerprint sign-in on mobile', plan: 'Every plan' },
]

export const FUNDRAISING_FAQ = [
  {
    question: 'Is a campaign a separate bank account or fund?',
    answer:
      'No. A campaign is a tag on ordinary gifts to one of your departments. The money goes through your church’s own Pay Bill into your own books, so your Cash Statement and ledger stay as they are, and anything left at close-out is already in the department.',
  },
  {
    question: 'Does Shiriki take a percentage of what we raise?',
    answer:
      'No. Gifts go straight to your church’s Pay Bill. You pay only the mobile money provider’s standard charges and your Shiriki plan.',
  },
  {
    question: 'Can people outside the church give or pledge?',
    answer:
      'Yes. Anyone with the campaign link can give by M-Pesa prompt or Pay Bill, and pledge as a guest. The public page shows totals only, never who gave.',
  },
  {
    question: 'Which plan do we need?',
    answer:
      'Campaigns, pledges, champions, department-backed campaigns and public campaign pages come with Ukuaji and above. The automatic WhatsApp group leaderboard comes with Kanisa and above. Fingerprint sign-in on the mobile app is on every plan.',
  },
]
