/**
 * Seed script — creates the singletons and content documents for the
 * Shiriki marketing site.
 *
 * Run with: `pnpm seed`
 *
 * REQUIRES:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID  (a real Sanity project ID, not empty)
 *   - NEXT_PUBLIC_SANITY_DATASET
 *   - NEXT_PUBLIC_SANITY_API_VERSION
 *   - SANITY_API_WRITE_TOKEN
 *       A token with "Editor" (or "Administrator") permissions, created in
 *       sanity.io/manage -> API -> Tokens. Write-access only; never exposed
 *       to the client.
 *
 * DOCUMENT IDs MUST NOT CONTAIN A DOT.
 * Sanity treats `.` in an `_id` as a path separator, and the default public
 * dataset grant only covers dot-free ids. Every id below uses hyphens.
 *
 * Idempotent: every document has a deterministic `_id` and is written with
 * `createOrReplace`, so re-running is safe.
 *
 * Importing this module has no side effects: the content arrays are exported
 * for `scripts/seed.test.ts`, and nothing is read from the environment or
 * written to Sanity unless the file is run directly (`pnpm seed`).
 */

import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// `next-sanity` re-exports `createClient` from `@sanity/client`. It's used
// here (rather than depending on `@sanity/client` directly) because it's
// already a project dependency with resolvable types.
import { createClient } from 'next-sanity'

import { PRIVACY_POLICY_LAST_UPDATED, privacyPolicyBody } from '../src/lib/legal/privacy-policy'
import { DEVELOPER_NAME } from '../src/lib/site'

// ---------------------------------------------------------------------------
// Portable Text helpers
// ---------------------------------------------------------------------------

let keyCounter = 0

/** Deterministic keys keep re-seeds from churning every array item's _key. */
function key(): string {
  keyCounter += 1
  return `k${keyCounter.toString(36)}`
}

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }

function span(text: string, marks: string[] = []): Span {
  return { _type: 'span', _key: key(), text, marks }
}

function block(text: string, style: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote' = 'normal') {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [span(text)],
  }
}

function h2(text: string) {
  return block(text, 'h2')
}

function h3(text: string) {
  return block(text, 'h3')
}

/** A bulleted list: one Portable Text block per item. */
function bullets(items: string[]) {
  return items.map((text) => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [span(text)],
  }))
}

function ref(id: string) {
  return { _type: 'reference', _key: key(), _ref: id }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Deterministic, dot-free document IDs
// ---------------------------------------------------------------------------

const givingChannelIds = {
  mpesaStk: 'giving-mpesa-stk',
  mpesaPaybill: 'giving-mpesa-paybill',
  airtelMoney: 'giving-airtel-money',
  cardPaystack: 'giving-card-paystack',
  ussd: 'giving-ussd',
}

const featureIds = {
  memberRecords: 'feature-member-records',
  givingFinance: 'feature-giving-finance',
  fundraisingCampaigns: 'feature-fundraising-campaigns',
  communication: 'feature-communication',
  eventsAttendance: 'feature-events-attendance',
  smallGroups: 'feature-small-groups',
  reportsInsights: 'feature-reports-insights',
  memberApp: 'feature-member-app',
}

const authorIds = {
  shirikiTeam: 'author-shiriki-team',
  amaniMwenda: 'author-amani-mwenda',
  guestTreasurer: 'author-guest-treasurer',
}

const categoryIds = {
  giving: 'category-giving',
  operations: 'category-operations',
  growth: 'category-growth',
  security: 'category-security',
  onboarding: 'category-onboarding',
}

// ---------------------------------------------------------------------------
// Giving channels
// ---------------------------------------------------------------------------

const givingChannels = [
  {
    _id: givingChannelIds.mpesaStk,
    _type: 'givingChannel',
    name: 'M-Pesa STK Push',
    description:
      'Members give in seconds — enter an amount, approve the M-Pesa prompt on their phone, and the gift is recorded instantly against their profile.',
    icon: 'Smartphone',
    badge: 'Instant',
    order: 1,
  },
  {
    _id: givingChannelIds.mpesaPaybill,
    _type: 'givingChannel',
    name: 'M-Pesa PayBill',
    description:
      'A dedicated PayBill number for your church. Members who prefer to give through the M-Pesa menu are matched and reconciled automatically. On Ukuaji and above, a campaign\u2019s account code (for example BUILD, or BUILD JOHN for a champion) sends the gift straight to that fundraising campaign.',
    icon: 'Landmark',
    badge: 'Familiar',
    order: 2,
  },
  {
    _id: givingChannelIds.airtelMoney,
    _type: 'givingChannel',
    name: 'Airtel Money',
    description:
      'Reach members on Airtel as easily as Safaricom. Airtel Money gifts flow into the same ledger as every other giving channel.',
    icon: 'Wallet',
    badge: 'Multi-network',
    order: 3,
  },
  {
    _id: givingChannelIds.cardPaystack,
    _type: 'givingChannel',
    name: 'Card (via Paystack)',
    description:
      'Visa and Mastercard giving for members and diaspora supporters, processed securely through Paystack with automatic receipts.',
    icon: 'CreditCard',
    badge: 'International',
    order: 4,
  },
  {
    _id: givingChannelIds.ussd,
    _type: 'givingChannel',
    name: 'USSD',
    description:
      'No smartphone or data bundle required. Members dial *710*12414# from any phone to give, check pledges, or request a statement \u2014 and, on Ukuaji and above, give to a campaign, make a pledge, or pay one off.',
    icon: 'Phone',
    badge: 'Works offline',
    order: 5,
  },
]

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

const features = [
  {
    _id: featureIds.memberRecords,
    _type: 'feature',
    title: 'Member records',
    description:
      'One searchable record per member and household, carrying contact details, sacraments, ministries, and every gift they have given.',
    icon: 'Users',
    bullets: [
      'Household and family linking',
      'Custom fields for ministries and departments',
      'Import members from Excel in minutes',
    ],
    order: 1,
    emphasis: true,
  },
  {
    _id: featureIds.givingFinance,
    _type: 'feature',
    title: 'Giving & finance',
    description:
      'Every gift — M-Pesa, Airtel Money, card, cash, or USSD — lands in one ledger with automatic pledges, tithe tracking, and statements.',
    icon: 'HandCoins',
    bullets: ['Automatic tithe & pledge tracking', 'Bank-ready reconciliation reports', 'Instant digital receipts'],
    order: 2,
    emphasis: true,
  },
  {
    _id: featureIds.fundraisingCampaigns,
    _type: 'feature',
    title: 'Fundraising campaigns',
    description:
      'Run a building fund, harambee, or mission drive with a target, a deadline, and its own Pay Bill account code. Members give by M-Pesa prompt, Pay Bill, USSD, or at the desk, and every gift counts towards the same progress bar.',
    icon: 'heart-handshake',
    bullets: [
      'A shareable public page with progress, updates, and a give button — totals only, never donor names',
      'Pledges that clear themselves as money arrives, with SMS reminders',
      'Champions who raise from their own circle with a personal code and leaderboard',
      'A campaign statement and close-out record for the board and auditors',
      'Four-eyes approval: nobody launches a drive alone',
    ],
    order: 3,
    emphasis: false,
  },
  {
    _id: featureIds.communication,
    _type: 'feature',
    title: 'Communication',
    description:
      'Reach the whole congregation or a single small group with SMS and email, and let your church WhatsApp group see who has given without anyone typing out a list.',
    icon: 'MessageCircle',
    bullets: [
      'Bulk SMS with delivery reports',
      'Automatic WhatsApp group leaderboard after every gift, sent from your church\u2019s own number',
      'Scheduled reminders for events',
    ],
    order: 4,
    emphasis: false,
  },
  {
    _id: featureIds.eventsAttendance,
    _type: 'feature',
    title: 'Events & attendance',
    description:
      'Plan services, conferences, and small group meetings, then track attendance with a tap — from the main sanctuary to every branch.',
    icon: 'CalendarCheck',
    bullets: ['QR check-in for services and events', 'Multi-campus attendance rollups', 'Volunteer scheduling'],
    order: 5,
    emphasis: false,
  },
  {
    _id: featureIds.smallGroups,
    _type: 'feature',
    title: 'Small groups & discipleship',
    description:
      'Track cell groups, Bible study attendance, and discipleship pathways so no member falls through the cracks.',
    icon: 'Users2',
    bullets: ['Group rosters and leader dashboards', 'Discipleship milestone tracking', 'Follow-up task lists'],
    order: 6,
    emphasis: false,
  },
  {
    _id: featureIds.reportsInsights,
    _type: 'feature',
    title: 'Reports & insights',
    description:
      'Board-ready dashboards for giving trends, attendance, and membership growth — exportable in one click for elders and treasurers.',
    icon: 'BarChart3',
    bullets: ['Giving trend dashboards', 'Attendance & growth reports', 'One-click CSV / PDF export'],
    order: 7,
    emphasis: false,
  },
  {
    _id: featureIds.memberApp,
    _type: 'feature',
    title: 'Member app with fingerprint sign-in',
    description:
      'Members give, pledge, and see their receipts in the Shiriki app. After the first sign-in by SMS code, a fingerprint is all it takes \u2014 the key that proves it is them never leaves their phone.',
    icon: 'smartphone',
    bullets: [
      'Fingerprint sign-in, bound to the member\u2019s own phone',
      'The app locks after 5 minutes away, and amounts are hidden from the app switcher',
      'Members see and sign out their other phones themselves',
    ],
    order: 8,
    emphasis: false,
  },
]

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

// Intentionally empty. This array held seven quotes attributed to pastors,
// treasurers and churches that do not exist — one of them citing a 40% lift in
// giving consistency. None of it was real, so none of it ships. Add entries
// here (or publish `testimonial` documents directly in the Studio) once there
// are quotes a named person has actually given.
const testimonials: Record<string, unknown>[] = []

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const faqDefs = [
  // ---------- Giving ----------
  {
    question: 'How does Shiriki support M-Pesa giving?',
    answer: [
      block(
        'Shiriki supports both M-Pesa STK Push and a dedicated PayBill number. Members who give via STK Push get an instant prompt on their phone; PayBill gifts are matched to member records automatically using the phone number and account reference on the transaction.',
      ),
      block('Every gift — however it arrives — lands in the same giving ledger, ready for reconciliation.'),
    ],
    category: 'Giving',
    order: 1,
  },
  {
    question: 'Can members give without a smartphone?',
    answer: [
      block(
        'Yes. Members can dial *710*12414# from any phone — smartphone or not — to give, check their pledge balance, or request a statement. No data bundle is required.',
      ),
    ],
    category: 'Giving',
    order: 2,
  },
  {
    question: 'Does Shiriki support Airtel Money?',
    answer: [
      block(
        'Yes. Airtel Money is a first-class giving channel on the Ukuaji plan and above. Airtel Money gifts flow into the same ledger as M-Pesa, card, and cash contributions — one reconciled view for your treasurer, regardless of which network the member uses.',
      ),
    ],
    category: 'Giving',
    order: 3,
  },
  {
    question: 'Can our diaspora members give by card?',
    answer: [
      block(
        'Yes. Visa and Mastercard giving is available through our Paystack integration on the Ukuaji plan and above. Members abroad can give from any browser without needing an M-Pesa account. Receipts are issued automatically.',
      ),
    ],
    category: 'Giving',
    order: 4,
  },
  {
    question: 'Can a member give to multiple departments in one transaction?',
    answer: [
      block(
        'Yes. Shiriki supports multi-category giving — a member can split a single M-Pesa payment across up to 10 departments or purposes (e.g. tithe, building fund, and youth ministry) in one transaction.',
      ),
    ],
    category: 'Giving',
    order: 5,
  },
  // ---------- Fundraising ----------
  {
    question: 'Can we run fundraising campaigns and harambees on Shiriki?',
    answer: [
      block(
        'Yes, on the Ukuaji plan and above. Give each drive — a building fund, a land purchase, a harambee, a mission trip — a target, optional dates, a department, and a short Pay Bill account code such as BUILD. Once a second person approves it, members give with your church’s own Pay Bill and that code, by M-Pesa prompt from the campaign page, through USSD, or at the desk, and every gift counts towards one progress bar.',
      ),
      block(
        'Each campaign gets a shareable public page on your church’s own Shiriki address with progress, updates, and a give button, plus a statement of money in and money out for the board. There is no limit on the number of campaigns.',
      ),
    ],
    category: 'Fundraising',
    order: 6,
  },
  {
    question: 'How do pledges get paid off?',
    answer: [
      block(
        'Automatically. Members pledge in the app, on the campaign page, through USSD, or on a pledge card at the desk. When a gift arrives, Shiriki applies it to that member’s open pledges oldest first — and only money given after the pledge was made can clear it, so old giving never makes a new promise look kept.',
      ),
      block(
        'Members see what they still owe and can pay the balance in one tap. Reminder SMS are optional, are sent only between 8am and 8pm, and draw from your church’s SMS credits.',
      ),
    ],
    category: 'Fundraising',
    order: 7,
  },
  {
    question: 'What are fundraising champions?',
    answer: [
      block(
        'Champions are members who raise money from their own circle. Each gets a personal code (for example, a giver types BUILD JOHN as the Pay Bill account), a personal page to share, and a dashboard of who gave through them. The campaign page shows a champion leaderboard with first names and initials, never donors. Champions are included on Ukuaji and above.',
      ),
    ],
    category: 'Fundraising',
    order: 8,
  },
  {
    question: 'Can a campaign count everything a department has ever received?',
    answer: [
      block(
        'Yes. A department-backed campaign counts every gift to its department, history included, whichever code the giver used — so a land drive’s total is the land department’s total. Switching a live campaign to this mode needs a second approver, and a daily check confirms the campaign and the department still agree. Available on Ukuaji and above.',
      ),
    ],
    category: 'Fundraising',
    order: 9,
  },
  {
    question: 'How does the automatic WhatsApp group leaderboard work?',
    answer: [
      block(
        'On the Kanisa plan and above, a church admin links your church’s own WhatsApp number by scanning a QR code in Settings, then picks the group for each campaign. After gifts come in, Shiriki posts an updated leaderboard to that group — gathered into one post about every minute, so a busy service does not flood the chat. If a post fails it is retried, never sent twice, and the campaign page shows whether the last one went out.',
      ),
      block(
        'Your church chooses how givers appear: full name, first name and initial (the default), or hidden with totals only. Any member can also choose to be listed as “Well-wisher”.',
      ),
    ],
    category: 'Fundraising',
    order: 10,
  },
  {
    question: 'Who can see donor names?',
    answer: [
      block(
        'Public campaign pages show totals only — amount raised, number of givers, days left — never names or amounts. Names are visible to your church staff and the department’s leaders, and each champion sees the people who gave through their own code. In WhatsApp leaderboards, names follow your church’s setting and each member’s own choice to stay anonymous.',
      ),
    ],
    category: 'Fundraising',
    order: 11,
  },
  // ---------- Pricing ----------
  {
    question: 'Is there a free trial?',
    answer: [
      block(
        'Yes. Every church starts with a 30-day free trial on the Msingi plan — M-Pesa STK Push giving, USSD giving, a member directory, attendance tracking, and 100 SMS included. No payment required to start.',
      ),
    ],
    category: 'Pricing',
    order: 12,
  },
  {
    question: 'What happens after the 30-day free trial?',
    answer: [
      block(
        'After 30 days, your church moves to the Msingi paid plan at KES 2,000 per month. You can upgrade to Ukuaji or Kanisa at any time — all your data, giving history, and member records carry over with zero downtime.',
      ),
    ],
    category: 'Pricing',
    order: 13,
  },
  {
    question: 'Do you charge a percentage on M-Pesa giving?',
    answer: [
      block(
        'We never add a markup on top of Safaricom\'s or Airtel\'s standard mobile money charges. Your church keeps 100% of every contribution, minus only the telco\'s standard transaction fee. Our revenue comes from the platform subscription, not from your offerings.',
      ),
    ],
    category: 'Pricing',
    order: 14,
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: [
      block(
        'Yes. Pay for 10 months upfront and get 12 months of access — that is roughly a 17% discount. Annual billing is available on Msingi, Ukuaji, and Kanisa plans, payable via M-Pesa or card.',
      ),
    ],
    category: 'Pricing',
    order: 15,
  },
  // ---------- Security ----------
  {
    question: 'Is our members\' data secure?',
    answer: [
      block(
        'All data is encrypted in transit and at rest. Card payments are processed by Paystack, a PCI DSS-compliant partner, so your church never handles raw card details. Each congregation’s records are isolated from every other church on the platform.',
      ),
    ],
    category: 'Security',
    order: 16,
  },
  {
    question: 'Are you compliant with the Kenya Data Protection Act?',
    answer: [
      block(
        'Yes. Shiriki is designed in alignment with the Kenya Data Protection Act (2019) and the guidelines issued by the Office of the Data Protection Commissioner (ODPC). Member data is processed solely for the purpose of church management, is never sold to third parties, and can be exported or deleted at the church\'s request.',
      ),
    ],
    category: 'Security',
    order: 17,
  },
  {
    question: 'Who can access our church\'s data?',
    answer: [
      block(
        'Only administrators your church has authorised. Shiriki uses role-based access control — you decide who can see member records, giving data, financial reports, and HR information. Each admin role has specific permissions, so your ushers do not see payroll and your treasurer does not manage events.',
      ),
    ],
    category: 'Security',
    order: 18,
  },
  {
    question: 'How does fingerprint sign-in on the Shiriki app work?',
    answer: [
      block(
        'The first time a member signs in, they confirm their phone with an SMS code. After that, the app creates a sign-in key that is locked inside the phone’s own security hardware, and a fingerprint is all it takes — no SMS code every week. The key never leaves the phone and cannot be copied to another device.',
      ),
      block(
        'The app locks after 5 minutes away, amounts are hidden in the app switcher, and members can see and sign out their other phones themselves. Fingerprint sign-in is included in every plan.',
      ),
    ],
    category: 'Security',
    order: 19,
  },
  // ---------- Operations ----------
  {
    question: 'Do you support multiple campuses or branches?',
    answer: [
      block(
        'Yes. The Kanisa plan supports up to 3 branches, and Shirikisho offers unlimited branches. Members, giving, and attendance can be tracked per campus and rolled up into a single view for church-wide leadership. Each branch can have its own M-Pesa PayBill and admin team.',
      ),
    ],
    category: 'Operations',
    order: 20,
  },
  {
    question: 'Can we run payroll for our church staff?',
    answer: [
      block(
        'Yes, on the Kanisa plan and above. The payroll module calculates Kenyan statutory deductions — PAYE with personal relief, NSSF Tier I and Tier II, and SHIF — automatically each month. Payslips are generated for every staff member.',
      ),
    ],
    category: 'Operations',
    order: 21,
  },
  {
    question: 'Can we export our data if we ever need to?',
    answer: [
      block(
        'Always. Member records, giving history, attendance data, and financial reports can be exported to CSV, Excel, or PDF at any time — your church\'s data belongs to your church. On the Shirikisho plan, we also provide a full data portability guarantee.',
      ),
    ],
    category: 'Operations',
    order: 22,
  },
  {
    question: 'How does the SMS allocation work?',
    answer: [
      block(
        'Each plan includes a monthly SMS allocation: 100 for Msingi, 200 for Ukuaji, and 500 for Kanisa. Unused SMS do not roll over. If you need more in a given month, you can top up at KES 0.70–0.80 per SMS depending on your plan. Automated giving receipts are included and do not count against your allocation.',
      ),
    ],
    category: 'Operations',
    order: 23,
  },
  // ---------- Getting started / Onboarding ----------
  {
    question: 'How long does onboarding take?',
    answer: [
      block(
        'Most churches are live within a week. The self-service setup wizard guides you through entering your church details, seeding your departments, and connecting your M-Pesa PayBill. For churches on the Kanisa and Shirikisho plans, we also provide a dedicated onboarding call to import existing member records from Excel and train your team.',
      ),
    ],
    category: 'Getting started',
    order: 24,
  },
  {
    question: 'Can we import our existing member records?',
    answer: [
      block(
        'Yes. Shiriki supports bulk member import from Excel (CSV or .xlsx). Upload your existing spreadsheet, map the columns to Shiriki fields, and your member directory is populated in minutes — including departments, groups, and contact details.',
      ),
    ],
    category: 'Getting started',
    order: 25,
  },
  {
    question: 'Do you offer support in Swahili?',
    answer: [
      block(
        'Yes — our support team assists churches across East Africa in both English and Swahili, by phone, WhatsApp, and email. The Shiriki app itself is also available in Kiswahili, and we are adding more local languages.',
      ),
    ],
    category: 'Getting started',
    order: 26,
  },
  {
    question: 'What do we need to get started?',
    answer: [
      block(
        'Just a phone number and an internet connection. Sign up at shiriki.site, choose your church\'s subdomain, and you are in the 30-day free trial immediately. To receive M-Pesa giving, you will need your own Safaricom PayBill or Till number and the Daraja API credentials — our setup wizard walks you through obtaining these.',
      ),
    ],
    category: 'Getting started',
    order: 27,
  },
  {
    question: 'Can we switch from another church management tool?',
    answer: [
      block(
        'Yes. We have helped churches migrate from spreadsheets, Churchtools, Breeze, and other platforms. Export your member data as a CSV from your current system, and use our bulk import to bring it into Shiriki. Giving history can also be imported. Contact our support team if you need help with migration.',
      ),
    ],
    category: 'Getting started',
    order: 28,
  },
  {
    question: 'Is there a Shiriki mobile app?',
    answer: [
      block(
        'Yes. The Shiriki app for Android is on Google Play at https://play.google.com/store/apps/details?id=app.shiriki.mobile. Members can give, see their giving history and receipts, follow campaigns and their own pledges, update their profile, and get church announcements and event reminders. After the first sign-in, a fingerprint is all it takes to open it. Members without a smartphone can still give by dialling *710*12414#.',
      ),
    ],
    category: 'Getting started',
    order: 29,
  },
].map((f) => ({
  _id: `faq-${slugify(f.question)}`,
  _type: 'faq',
  question: f.question,
  answer: f.answer,
  category: f.category,
  order: f.order,
}))

// ---------------------------------------------------------------------------
// Blog: authors, categories, posts
// ---------------------------------------------------------------------------

const authors = [
  {
    _id: authorIds.shirikiTeam,
    _type: 'author',
    name: 'Shiriki Team',
    slug: { _type: 'slug', current: 'shiriki-team' },
    role: 'Editorial',
    bio: 'Notes and guides from the Shiriki team on church operations, giving, and technology across East Africa.',
  },
  {
    _id: authorIds.amaniMwenda,
    _type: 'author',
    name: 'Amani Mwenda',
    slug: { _type: 'slug', current: 'amani-mwenda' },
    role: 'Product',
    bio: 'Product lead at Shiriki. Writes about how technology can serve the local church without getting in the way.',
  },
  {
    _id: authorIds.guestTreasurer,
    _type: 'author',
    name: 'Guest Contributor',
    slug: { _type: 'slug', current: 'guest-contributor' },
    role: 'Guest',
    bio: 'Practitioner perspectives from church treasurers, pastors, and administrators across East Africa.',
  },
]

const categories = [
  {
    _id: categoryIds.giving,
    _type: 'category',
    title: 'Giving',
    slug: { _type: 'slug', current: 'giving' },
    description: 'Mobile money, tithes, pledges, and digital giving.',
  },
  {
    _id: categoryIds.operations,
    _type: 'category',
    title: 'Church operations',
    slug: { _type: 'slug', current: 'church-operations' },
    description: 'Membership, attendance, and day-to-day administration.',
  },
  {
    _id: categoryIds.growth,
    _type: 'category',
    title: 'Growth',
    slug: { _type: 'slug', current: 'growth' },
    description: 'Discipleship, small groups, and multiplying campuses.',
  },
  {
    _id: categoryIds.security,
    _type: 'category',
    title: 'Security & compliance',
    slug: { _type: 'slug', current: 'security-compliance' },
    description: 'Data protection, privacy, and keeping your church\'s information safe.',
  },
  {
    _id: categoryIds.onboarding,
    _type: 'category',
    title: 'Getting started',
    slug: { _type: 'slug', current: 'getting-started' },
    description: 'Onboarding guides, setup walkthroughs, and first steps with Shiriki.',
  },
]

const postDefs = [
  {
    title: 'Why M-Pesa STK Push is changing tithing in Kenyan churches',
    slug: 'mpesa-stk-push-tithing-kenya',
    excerpt:
      'From cash offerings to instant mobile prompts — how STK Push is making it easier for congregations to give consistently, and for treasurers to reconcile it.',
    publishedAt: '2026-06-02T07:00:00Z',
    categoryId: categoryIds.giving,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('From envelopes to a phone prompt'),
      block(
        'For decades, giving in most East African churches meant a physical offering basket, a hand-written pledge card, or a trip to the bank on Monday morning. Mobile money changed that gradually — and STK Push is changing it again, this time instantly.',
      ),
      block(
        'STK Push lets a member enter an amount and immediately approve an M-Pesa prompt on their own phone, without leaving the service or the app they are using. The gift is recorded the moment it clears, matched automatically to the member\u2019s profile.',
      ),
      h3('What this means for treasurers'),
      bullets([
        'No more manual matching of PayBill transactions to member names',
        'Real-time visibility into service-by-service giving',
        'Automatic digital receipts, reducing end-of-year statement requests',
      ]),
      block(
        'Kwa kanisa lolote linaloendesha huduma nyingi kwa wiki, hii ina maana kubwa: fedha zinaonekana papo hapo, na hakuna haja ya kusubiri hadi Jumatatu kuoanisha malipo.',
      ),
    ],
  },
  {
    title: 'A practical guide to multi-campus attendance tracking',
    slug: 'multi-campus-attendance-tracking-guide',
    excerpt:
      'Running two, three, or ten campuses? Here is how growing churches keep an accurate, church-wide view of attendance without extra paperwork.',
    publishedAt: '2026-05-14T07:00:00Z',
    categoryId: categoryIds.operations,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('The problem with paper attendance registers'),
      block(
        'As churches expand from a single sanctuary to multiple campuses \u2014 or even multiple services in one building \u2014 attendance tracking on paper quickly breaks down. Registers get lost, numbers get double-counted, and leadership loses the church-wide picture.',
      ),
      h3('A simpler approach'),
      bullets([
        'QR check-in at the door, scanned by ushers or self-service kiosks',
        'One dashboard showing attendance per campus, per service, and church-wide',
        'Automatic flags for members who have not attended in several weeks, for follow-up',
      ]),
      block(
        'The number in the board report matters less than what sits behind it: campus by campus, who was present, who was missing, and who might need a phone call this week.',
      ),
    ],
  },
  {
    title: 'Building a discipleship pathway your small groups will actually follow',
    slug: 'discipleship-pathway-small-groups',
    excerpt:
      'A clear, trackable path from new believer to small group leader \u2014 and how to see, at a glance, where every member is on that journey.',
    publishedAt: '2026-04-22T07:00:00Z',
    categoryId: categoryIds.growth,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('Discipleship needs a map, not only a syllabus'),
      block(
        'Most churches have a discipleship vision, but far fewer have a way to track whether members are actually moving through it. A pathway only works if leaders can see, at a glance, where each member stands.',
      ),
      h3('Four stages worth tracking'),
      bullets([
        'New believer \u2014 first steps and baptism',
        'Rooted \u2014 regular small group attendance',
        'Serving \u2014 active in a ministry team',
        'Leading \u2014 discipling others in a small group',
      ]),
      block(
        'When this is tracked per member rather than kept in a leader\u2019s memory, follow-up becomes systematic instead of accidental \u2014 and you can see growth happening rather than assume it.',
      ),
    ],
  },
  // ---- New articles ----
  {
    title: 'Your first week on Shiriki: a step-by-step onboarding guide',
    slug: 'first-week-onboarding-guide',
    excerpt:
      'From sign-up to your first live M-Pesa contribution \u2014 everything a church admin needs to do in seven days to go live on Shiriki.',
    publishedAt: '2026-07-15T07:00:00Z',
    categoryId: categoryIds.onboarding,
    authorId: authorIds.amaniMwenda,
    body: [
      h2('Day 1: Sign up and claim your address'),
      block(
        'Head to shiriki.site and create your church\u2019s account. You will pick a subdomain \u2014 for example, grace.shiriki.site \u2014 and verify your phone number with an OTP. The whole process takes under two minutes, and you are immediately inside the 30-day free trial.',
      ),
      h3('Day 2: Complete the setup wizard'),
      block(
        'The setup wizard walks you through entering your church\u2019s name, location, and logo, then seeds your default giving departments \u2014 tithes, offerings, building fund, and so on. You can rename or add departments later, but these defaults cover most Kenyan churches.',
      ),
      h3('Day 3\u20134: Connect your M-Pesa PayBill'),
      block(
        'Enter your Safaricom Daraja API credentials (Consumer Key, Consumer Secret, and Passkey). The wizard verifies them against Safaricom in real time and registers your C2B callback URLs automatically. If anything fails, it tells you exactly which credential was rejected.',
      ),
      bullets([
        'You need an active Safaricom PayBill or Till number',
        'Daraja credentials are created at developer.safaricom.co.ke',
        'Credentials are encrypted at rest \u2014 we never see them in plain text',
      ]),
      h3('Day 5: Import your members'),
      block(
        'Export your current member list from Excel or Google Sheets as a CSV. Use the bulk import tool to map columns \u2014 name, phone, department, group \u2014 and your directory is populated in minutes. Phone numbers are validated, duplicates are flagged, and groups are created automatically.',
      ),
      h3('Day 6: Invite your admin team'),
      block(
        'Add your treasurer, ushers, and department heads as admins with the right roles. Each role has specific permissions: your ushers can check in visitors but cannot view financial reports; your treasurer can export reconciliation data but cannot edit member profiles.',
      ),
      h3('Day 7: Go live'),
      block(
        'Run a test STK Push contribution from your own phone. If it arrives in the ledger matched to your member profile, you are live. Share the USSD code *710*12414# with your congregation and announce it from the pulpit on Sunday.',
      ),
      block(
        'Mchakato mzima \u2014 kutoka kusajili hadi kupokea mchango wa kwanza \u2014 unaweza kukamilika ndani ya wiki moja. Wengi wa makanisa yetu yanafanya hivyo.',
      ),
    ],
  },
  {
    title: 'How a church treasurer can reconcile M-Pesa in 10 minutes, not 10 hours',
    slug: 'treasurer-mpesa-reconciliation-guide',
    excerpt:
      'A practical walkthrough for church treasurers: how to go from a Monday morning pile of M-Pesa statements to a fully reconciled ledger before tea.',
    publishedAt: '2026-07-28T07:00:00Z',
    categoryId: categoryIds.giving,
    authorId: authorIds.guestTreasurer,
    body: [
      h2('The Monday morning problem'),
      block(
        'If you are a church treasurer in Kenya, you know the routine: arrive at the office on Monday morning with a stack of M-Pesa confirmations from Sunday\u2019s three services. Open the PayBill statement in one tab, the member register in another, and start matching \u2014 line by line, phone number by phone number. On a good week, it takes two hours. On a harvest Sunday, it takes all day.',
      ),
      h3('What automatic reconciliation looks like'),
      block(
        'When your church uses Shiriki, every M-Pesa gift \u2014 whether it arrives via STK Push, PayBill, or USSD \u2014 is matched to the member\u2019s profile the moment Safaricom confirms it. By Monday morning, the giving ledger is already complete.',
      ),
      bullets([
        'STK Push gifts are matched instantly by phone number',
        'PayBill gifts are matched by phone number and account reference',
        'Unmatched gifts (e.g. a visitor using a new number) are parked for admin resolution \u2014 never lost',
        'Duplicate callbacks from Safaricom are caught by race-condition guards, so no gift is counted twice',
      ]),
      h3('Your new Monday morning'),
      block(
        'Open the Shiriki dashboard. Check the reconciliation summary: total giving per department, per service, per payment channel. Export the report as PDF for the board or Excel for your spreadsheet. Done before tea.',
      ),
      h3('What about cash and envelopes?'),
      block(
        'Cash and envelope offerings are entered manually by an usher or the treasurer. Each entry generates a receipt number (RCP-YYYYMMDD-NNNN) and lands in the same ledger as the mobile money gifts. One ledger, every channel.',
      ),
    ],
  },
  {
    title: 'The Kenya Data Protection Act and your church: what you need to know',
    slug: 'kenya-data-protection-act-churches',
    excerpt:
      'The Data Protection Act (2019) applies to churches too. Here is what it means for how you collect, store, and share member information.',
    publishedAt: '2026-08-04T07:00:00Z',
    categoryId: categoryIds.security,
    authorId: authorIds.amaniMwenda,
    body: [
      h2('Yes, the Act applies to churches'),
      block(
        'The Kenya Data Protection Act (2019), enforced by the Office of the Data Protection Commissioner (ODPC), applies to any organisation that processes personal data \u2014 including churches, fellowships, and para-church bodies. If you hold member names, phone numbers, giving records, or attendance logs, you are a data controller under the Act.',
      ),
      h3('What churches must do'),
      bullets([
        'Collect only the data you need for a clear, lawful purpose (church administration and pastoral care)',
        'Tell members what data you hold and why \u2014 a simple privacy notice suffices',
        'Keep data accurate and up to date',
        'Protect it against unauthorised access, loss, or damage',
        'Delete or anonymise it when it is no longer needed',
        'Allow members to request access to their data, or ask for it to be corrected or deleted',
      ]),
      h3('How Shiriki helps'),
      block(
        'Shiriki encrypts all data in transit and at rest. Card payments are processed by PCI DSS-compliant Paystack \u2014 we never see or store card numbers. Role-based access control means only authorised administrators can see sensitive records. Members can be soft-deleted (anonymised) rather than hard-deleted, preserving statistical integrity while removing personal identifiers.',
      ),
      block(
        'Every church\u2019s data can be exported at any time in CSV, Excel, or PDF format. Your church\u2019s data belongs to your church, and you can take it with you if you ever leave the platform.',
      ),
      h3('Practical steps for your church'),
      bullets([
        'Add a privacy notice to your church\u2019s notice board or website',
        'Review who has admin access and whether their permissions match their role',
        'Delete records for members who have formally transferred or requested removal',
        'Do not share member phone numbers or giving data with third parties without consent',
      ]),
    ],
  },
  {
    title: 'USSD giving: how *710*12414# reaches the members no app can',
    slug: 'ussd-giving-no-smartphone-required',
    excerpt:
      'Not every church member has a smartphone or data bundle. USSD giving makes digital contributions possible from any phone, anywhere.',
    publishedAt: '2026-08-11T07:00:00Z',
    categoryId: categoryIds.giving,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('The digital divide in Kenyan churches'),
      block(
        'Kenya\u2019s smartphone penetration is growing fast, but it is not universal. In many congregations \u2014 especially in rural areas, smaller towns, and among older members \u2014 feature phones are still common. These members can send and receive M-Pesa, but they cannot download an app or browse a website.',
      ),
      block(
        'USSD bridges this gap. By dialling *710*12414# from any phone, a member enters a simple menu-driven flow: choose a church, select a department, enter an amount, and confirm with their M-Pesa PIN. No data, no app, no smartphone.',
      ),
      h3('What a member can do on USSD'),
      bullets([
        'Give to one or more departments in a single session',
        'Check their total giving for the year',
        'View their last three transactions',
        'Request a full statement sent to their phone by SMS',
        'Register as a new member of the church',
      ]),
      h3('Behind the scenes'),
      block(
        'USSD sessions are backed by Redis with a 10-minute TTL. Each session is rate-limited (10 requests per minute per phone number) to prevent abuse. Invalid input retries the current step without losing session state \u2014 a typo does not reset the flow.',
      ),
      block(
        'Kwa wanachama walio mashambani, hii ndio njia pekee ya kuchangia kimtandao. USSD imewafanya wawe sehemu ya mfumo wa kanisa, si watazamaji tu.',
      ),
    ],
  },
  {
    title: 'Running church payroll in Kenya: PAYE, NSSF, and SHIF explained',
    slug: 'church-payroll-kenya-paye-nssf-shif',
    excerpt:
      'A plain-language guide to Kenyan statutory deductions for church administrators \u2014 and how Shiriki calculates them automatically.',
    publishedAt: '2026-08-18T07:00:00Z',
    categoryId: categoryIds.operations,
    authorId: authorIds.amaniMwenda,
    body: [
      h2('Why churches need proper payroll'),
      block(
        'If your church employs a pastor, secretary, caretaker, or any other staff member on a salary, you are an employer under Kenyan law. That means you are required to deduct PAYE (income tax), NSSF (pension), and SHIF (health insurance) from every salary and remit them to the relevant authorities.',
      ),
      block(
        'Getting this wrong has consequences: KRA penalties for late or incorrect PAYE, NSSF surcharges, and unhappy staff who discover their statutory contributions were never remitted.',
      ),
      h3('The three statutory deductions'),
      bullets([
        'PAYE (Pay As You Earn) \u2014 income tax calculated on graduated bands, with personal relief of KES 2,400/month deducted. Your church remits this to KRA monthly via iTax.',
        'NSSF (National Social Security Fund) \u2014 Tier I covers the first KES 7,000 of pensionable pay; Tier II covers the next KES 29,000. Both employee and employer contribute equally.',
        'SHIF (Social Health Insurance Fund) \u2014 replaced the old NHIF. Calculated as 2.75% of gross salary, with both employee and employer contributing. Remitted to the Social Health Authority.',
      ]),
      h3('How Shiriki handles it'),
      block(
        'On the Kanisa plan and above, the payroll module calculates all three deductions automatically each month based on each staff member\u2019s gross salary. It generates a payslip showing gross pay, each deduction, and net pay. Your treasurer reviews and approves the payroll, then disburses salaries \u2014 and has a clear record for the annual P9 filing.',
      ),
      h3('A note on statutory rates'),
      block(
        'Kenyan statutory rates are updated periodically by the government. Shiriki tracks the current gazette rates, but your church should verify rates against the latest KRA and NSSF publications before the first payroll run. The payroll module is gated behind the ENABLE_PAYROLL feature flag until rates are confirmed.',
      ),
    ],
  },
  {
    title: 'Msingi, Ukuaji, Kanisa, or Shirikisho: which plan fits your church?',
    slug: 'choosing-the-right-plan',
    excerpt:
      'A practical guide to picking the right Shiriki plan based on your congregation size, giving channels, and operational needs.',
    publishedAt: '2026-08-25T07:00:00Z',
    categoryId: categoryIds.onboarding,
    authorId: authorIds.amaniMwenda,
    body: [
      h2('Start with your member count'),
      block(
        'The simplest way to pick a plan is by how many members your church has. Msingi covers up to 150, Ukuaji up to 500, Kanisa up to 2,000, and Shirikisho is unlimited. If you are near a boundary, pick the plan your church will grow into over the next 12 months \u2014 upgrading is instant, but planning ahead saves the disruption.',
      ),
      h3('Msingi: the foundation'),
      block(
        'Best for a small fellowship, home church, or new plant with under 150 members. You get M-Pesa STK Push and USSD giving, a member directory, basic attendance, 100 SMS per month, one admin login, and fingerprint sign-in on the member app (every plan has it). Start with a 30-day free trial, then KES 2,000 per month.',
      ),
      h3('Ukuaji: growth mode'),
      block(
        'Best for a growing urban or peri-urban church between 150 and 500 members that needs all giving channels (including PayBill, Airtel Money, and card), up to 5 admin roles, events, email notifications, financial reports, and 200 SMS. Ukuaji is also where fundraising campaigns start: a public page for every drive, pledges that clear themselves as money arrives, champions with personal codes, and campaigns that count a whole department\u2019s giving. KES 3,500 per month.',
      ),
      h3('Kanisa: the full church office'),
      block(
        'Best for an established church between 500 and 2,000 members with salaried staff, a finance committee, and possibly 2\u20133 branches. Adds unlimited admin roles, double-entry accounting, budgets, expense claims, HR, Kenyan payroll (PAYE/NSSF/SHIF), paid ticketing, YouTube sermon sync, an automatic WhatsApp group leaderboard posted from your church\u2019s own number after every gift, and 500 SMS. KES 7,500 per month.',
      ),
      h3('Shirikisho: the network'),
      block(
        'Best for a diocese, conference, union, or church network with 4+ branches or 2,000+ members. Custom pricing based on the number of branches, members, and support needs. Includes consolidated financial reporting, a dedicated account manager, SLA, custom domain, and API access.',
      ),
      h3('Still not sure?'),
      block(
        'Every church starts with the same 30-day free trial. Try Msingi, explore the features, and talk to our sales team if you need help deciding. We will recommend the plan that fits your church today and the one you will grow into.',
      ),
    ],
  },
  {
    title: 'From first-time visitor to active member: a digital follow-up workflow',
    slug: 'visitor-to-member-follow-up-workflow',
    excerpt:
      'Most churches lose first-time visitors in the gap between the welcome desk and the next Sunday. Here is how to close that gap with a simple digital workflow.',
    publishedAt: '2026-09-01T07:00:00Z',
    categoryId: categoryIds.growth,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('The gap between "welcome" and "come back"'),
      block(
        'A first-time visitor fills out a welcome card. The usher puts it in a box. On Monday, someone enters the name into a spreadsheet. By Wednesday, the pastor calls \u2014 if the phone number was legible. By the following Sunday, the card is in a pile with forty others. The visitor, feeling anonymous, does not return.',
      ),
      block(
        'This is not a hospitality failure \u2014 it is a systems failure. The church cares, but the process between caring and acting has too many manual steps.',
      ),
      h3('A better workflow'),
      bullets([
        'Step 1: An usher logs the visitor in Shiriki at the door \u2014 name, phone, how they heard about the church. Takes 30 seconds.',
        'Step 2: The visitor automatically receives a welcome SMS within the hour, thanking them for visiting.',
        'Step 3: On Monday morning, the follow-up team sees a list of every first-time visitor from Sunday, with phone numbers ready to call.',
        'Step 4: After a second visit, the visitor is flagged for conversion \u2014 a one-tap action to make them a full member with a department and group assignment.',
        'Step 5: Visitors who have not returned in 3 weeks are flagged for a follow-up call. No one falls through the cracks.',
      ]),
      h3('From numbers to names'),
      block(
        'The goal is not visitor metrics \u2014 it is making sure every person who walks through your doors is seen, welcomed, and followed up with. A digital workflow does not replace personal care; it makes sure personal care happens consistently, even when the church is growing faster than the follow-up team.',
      ),
      block(
        'Kila mgeni anayeingia kanisani ni mtu, si nambari. Mfumo wa kidijitali unahakikisha kwamba kila mtu anaonekana na kufuatiliwa, hata wakati kanisa linakua kwa kasi.',
      ),
    ],
  },
  {
    title: 'How to run a harambee on Shiriki, from first pledge to final statement',
    slug: 'run-a-harambee-on-shiriki',
    excerpt:
      'A building fund or harambee usually lives in an exercise book, a spreadsheet and a dozen WhatsApp messages. Here is how to run one on Shiriki, with your own Pay Bill, a public page, pledges, champions and a statement the board can trust.',
    publishedAt: '2026-11-03T07:00:00Z',
    categoryId: categoryIds.giving,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('The exercise book problem'),
      block(
        'Most church drives start the same way. The pastor announces a target, the treasurer opens an exercise book, and pledges are written on cards. Money arrives by Pay Bill, by envelope and at the harambee itself, and after every service someone retypes the list for the WhatsApp group. By the end, nobody is quite sure the total in the book matches the money in the bank.',
      ),
      block(
        'A campaign on Shiriki is not a separate fund. It is a tag on ordinary gifts to one of your departments, so your books, your Cash Statement and your department totals stay exactly as they are — and the campaign simply counts what belongs to it.',
      ),
      h3('Step 1: create the campaign'),
      bullets([
        'Give it a title, a one-line summary, a story and a cover photo',
        'Set a target and, if you want one, a start and end date',
        'Choose the department the money belongs to, for example Building',
        'Pick a short Pay Bill account code of letters or digits, for example BUILD',
        'Decide whether to allow pledges and champions',
      ]),
      h3('Step 2: a second person approves it'),
      block(
        'Nobody launches a drive alone. A church admin or pastor who did not create the campaign approves it (four-eyes approval). Once it is live, the department and the Pay Bill code are locked, because members have already started using them.',
      ),
      h3('Step 3: share the public page'),
      block(
        'Every campaign gets a public page on your church’s own Shiriki address. It shows the story, a progress bar, the amount raised, the number of givers, days left, your updates and a give button that sends an M-Pesa prompt. It never shows donor names or amounts — totals only. Share it to WhatsApp, Facebook, X or by SMS, and the link preview always shows today’s figures.',
      ),
      h3('Step 4: every channel counts'),
      bullets([
        'Pay Bill: members use your church’s Pay Bill with BUILD as the account number',
        'M-Pesa prompt: from the public page or the member app',
        'USSD: from any phone, no data bundle needed',
        'At the desk: a recorder tags cash and envelope gifts to the campaign',
      ]),
      h3('Step 5: pledges and champions'),
      block(
        'Members pledge in the app, on the public page (a visitor confirms with an SMS code), by USSD or on a pledge card. As money arrives, pledges clear themselves. Champions raise from their own circle with a personal code — BUILD JOHN on Pay Bill — and see who gave through them on their own dashboard.',
      ),
      h3('Step 6: updates, statement and close-out'),
      block(
        'Post updates as the walls go up and, if you want, text everyone who has given (from your church’s SMS credits). The campaign statement lists money in and money out with a running balance, ready for the board and the auditors. When the drive ends, close it out: the final statement is saved, and any surplus stays in the department. A late Pay Bill payment to a closed campaign is still credited to it.',
      ),
      h3('Which plan?'),
      block(
        'Fundraising campaigns, public pages, pledges, champions and department-backed campaigns are included on Ukuaji and above. The automatic WhatsApp group leaderboard is included on Kanisa and above.',
      ),
      block(
        'Harambee ni ya wote. Kwa Shiriki, kila mchango — kwa Pay Bill, USSD au mezani — unaonekana kwenye jumla moja, na kila ahadi inafuatiliwa bila daftari.',
      ),
    ],
  },
  {
    title: 'Automatic WhatsApp group leaderboards: no more typing out the list',
    slug: 'whatsapp-group-leaderboards',
    excerpt:
      'After every service, someone types out who gave what for the church WhatsApp group. On Shiriki’s Kanisa plan, the group gets an updated leaderboard after every gift, from your church’s own number, with names shown the way your church chooses.',
    publishedAt: '2026-11-10T07:00:00Z',
    categoryId: categoryIds.operations,
    authorId: authorIds.amaniMwenda,
    body: [
      h2('The Sunday-night list'),
      block(
        'In many churches the most read message of the week is the contributors’ list: every name, every amount, a running total, posted to the church WhatsApp group by a tired treasurer late at night. It works because people like to see the drive moving. It breaks when the list is late, when a name is missed, or when the treasurer is away.',
      ),
      h3('How it works on Shiriki'),
      bullets([
        'A church admin links your church’s own WhatsApp number by scanning a QR code in Settings — the same way you would open WhatsApp on a computer',
        'Each campaign is given the group it posts to',
        'When gifts arrive — Pay Bill, M-Pesa prompt, USSD or at the desk — Shiriki posts an updated leaderboard to that group',
        'Gifts are gathered into one post about every minute per campaign, so a busy service does not flood the chat',
        'If WhatsApp is unreachable the post is retried, never sent twice, and the campaign page shows whether the last post went out',
      ]),
      block(
        'Posts come from your church’s own number into your own groups. Shiriki never posts from a shared platform number, and one church’s session never touches another church’s groups.',
      ),
      h3('Names, the way your church chooses'),
      block(
        'Kenya’s Data Protection Act asks churches to think about how members’ names are shared. So each church picks how givers appear in WhatsApp lists: full name, first name and initial (the default), or hidden, with totals only. On top of that, any member can choose to be listed as “Well-wisher”. Public web pages are always totals only.',
      ),
      h3('A preview that matches the post'),
      block(
        'Every post carries a link to the campaign page. Its preview — title, amount raised, target — always matches the figures in the post it came with, so nobody sees yesterday’s total under today’s message.',
      ),
      h3('Which plan?'),
      block(
        'The automatic WhatsApp group leaderboard is included on Kanisa and above, because it keeps a WhatsApp session running for your church. On Ukuaji, treasurers can still share the contributor list to the group by hand in one tap.',
      ),
      block(
        'Hakuna tena kuandika orodha ya wachangiaji kila Jumapili usiku. Kikundi cha WhatsApp kinaona maendeleo papo hapo.',
      ),
    ],
  },
  {
    title: 'Pledges that clear themselves: how Shiriki matches gifts to promises',
    slug: 'pledges-that-clear-themselves',
    excerpt:
      'Chasing pledges by phone and ticking them off in Excel is slow and easy to get wrong. Here is how Shiriki applies each gift to the right pledge automatically, and why only money given after a pledge can clear it.',
    publishedAt: '2026-11-17T07:00:00Z',
    categoryId: categoryIds.giving,
    authorId: authorIds.shirikiTeam,
    body: [
      h2('A pledge is a promise, not a payment'),
      block(
        'A pledge card says “I will give KES 50,000 to the building fund by June”. Then the money arrives in pieces: KES 5,000 by Pay Bill, KES 2,000 in an envelope, a bigger gift at the harambee. Someone has to match each piece to the right promise, and that someone is usually the treasurer, with a spreadsheet, on a Monday.',
      ),
      h3('Where pledges come from'),
      bullets([
        'The member app or the member portal: My pledges, then Make a pledge',
        'The campaign’s public page: a visitor pledges and confirms with an SMS code, no account needed',
        'USSD: from any phone',
        'A pledge card: staff record it in the pledge register',
      ]),
      h3('How gifts are applied'),
      bullets([
        'Each gift is applied to the giver’s open pledges oldest first',
        'Only money given after the pledge was made can clear it — old giving never makes a new promise look kept',
        'A gift to a campaign pays that campaign’s pledges; a gift to a department-backed campaign pays the campaign’s pledges first, then the giver’s pledges to that department',
        'Anything beyond the pledge balance stays a normal gift',
        'Voiding a receipt reverses what it paid',
      ]),
      block(
        'A pledge paid in full becomes Fulfilled; one past its due date with a balance becomes Overdue. Members see what they still owe and pay the balance in one tap.',
      ),
      h3('Reminders, without the phone calls'),
      block(
        'If your church switches them on, Shiriki sends a monthly reminder, one a few days before the due date and an overdue notice, only between 8am and 8pm and never more than one a day. Every reminder draws from your church’s SMS credits, and Shiriki tells you clearly when credits run out.',
      ),
      h3('The register'),
      block(
        'The pledge register shows who pledged what, what has been paid and the balance, filtered by campaign, department or status, and exports to Excel or PDF. A daily check flags any pledge that a later gift should have paid but did not.',
      ),
      block(
        'Ahadi ni deni. Shiriki inahakikisha kila mchango unapunguza ahadi sahihi, bila daftari wala simu za kukumbusha.',
      ),
    ],
  },
]

const posts = postDefs.map((p) => ({
  _id: `post-${p.slug}`,
  _type: 'post',
  title: p.title,
  slug: { _type: 'slug', current: p.slug },
  excerpt: p.excerpt,
  body: p.body,
  author: { _type: 'reference', _ref: p.authorId },
  categories: [ref(p.categoryId)],
  publishedAt: p.publishedAt,
}))

// ---------------------------------------------------------------------------
// Pricing plans (KES)
// ---------------------------------------------------------------------------

/**
 * The plan bullet for each flag added in sprint 2026-11 (decision P-D3), on the
 * cheapest plan that includes it in the backend's `tenants/plans.py`. Higher
 * plans include it too ("everything in the plan below"), so it is listed once.
 * Keyed by flag name so a contract test can compare it with `plans.py`.
 */
const planFlagBullets = {
  device_sign_in: { plan: 'Msingi', bullet: 'Fingerprint sign-in on the member app' },
  giving_campaigns: { plan: 'Ukuaji', bullet: 'Fundraising campaigns with public pages' },
  campaign_public_pages: { plan: 'Ukuaji', bullet: 'Fundraising campaigns with public pages' },
  pledge_module: { plan: 'Ukuaji', bullet: 'Pledges that clear themselves as money arrives' },
  fundraising_champions: { plan: 'Ukuaji', bullet: 'Fundraising champions with personal codes' },
  department_campaigns: { plan: 'Ukuaji', bullet: 'Department-backed campaigns, history included' },
  whatsapp_leaderboard: { plan: 'Kanisa', bullet: 'Automatic WhatsApp group leaderboard' },
} as const

const pricingPlans = [
  {
    _type: 'plan',
    _key: key(),
    name: 'Msingi',
    priceKES: 2000,
    period: 'month',
    description: 'For small congregations getting off paper and WhatsApp. Start with a 30-day free trial.',
    features: [
      'Up to 150 members',
      'M-Pesa STK Push & USSD giving',
      '100 SMS/month included',
      'Basic attendance tracking',
      '1 admin login',
      planFlagBullets.device_sign_in.bullet,
      'Community support',
    ],
    highlighted: false,
    ctaLabel: 'Start free trial',
  },
  {
    _type: 'plan',
    _key: key(),
    name: 'Ukuaji',
    priceKES: 3500,
    period: 'month',
    description: 'For growing churches that need every giving channel, multiple roles, and proper reconciliation.',
    features: [
      'Up to 500 members',
      'All giving channels (M-Pesa, Airtel Money, card, USSD)',
      planFlagBullets.giving_campaigns.bullet,
      planFlagBullets.pledge_module.bullet,
      planFlagBullets.fundraising_champions.bullet,
      planFlagBullets.department_campaigns.bullet,
      'Up to 5 admin roles',
      'Events & RSVPs',
      '200 SMS/month included',
      'Email notifications',
      'Financial reports & audit trail',
    ],
    highlighted: true,
    ctaLabel: 'Request a demo',
  },
  {
    _type: 'plan',
    _key: key(),
    name: 'Kanisa',
    priceKES: 7500,
    period: 'month',
    description: 'For established churches with staff, finance operations, and up to 3 branches.',
    features: [
      'Up to 2,000 members',
      'Unlimited admin roles',
      'Double-entry accounting & budgets',
      'HR, leave & Kenyan payroll (PAYE/NSSF/SHIF)',
      'Paid event ticketing & YouTube sync',
      planFlagBullets.whatsapp_leaderboard.bullet,
      '500 SMS/month included',
      'Up to 3 branches',
    ],
    highlighted: false,
    ctaLabel: 'Request a demo',
  },
  {
    _type: 'plan',
    _key: key(),
    name: 'Shirikisho',
    period: 'custom',
    description: 'For dioceses, conferences, and multi-branch churches at scale.',
    features: [
      'Unlimited members & branches',
      'Consolidated financial reporting',
      'Custom domain & API access',
      'Dedicated account manager & SLA',
      'Custom integrations',
    ],
    highlighted: false,
    ctaLabel: 'Contact sales',
  },
]

// ---------------------------------------------------------------------------
// Singletons
// ---------------------------------------------------------------------------

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  name: 'Shiriki',
  tagline: 'Church management that runs on M-Pesa.',
  contactEmail: 'hello@shiriki.site',
  salesEmail: 'sales@shiriki.site',
  phone: '+254 797 030 300',
  ussdCode: '*710*12414#',
  address: {
    streetAddress: 'Westlands',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  socialLinks: [
    { _type: 'socialLink', _key: key(), platform: 'x', url: 'https://x.com/shirikidotsite' },
    {
      _type: 'socialLink',
      _key: key(),
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/shirikisite',
    },
    { _type: 'socialLink', _key: key(), platform: 'facebook', url: 'https://www.facebook.com/shirikisite' },
    { _type: 'socialLink', _key: key(), platform: 'youtube', url: 'https://www.youtube.com/@shirikisite' },
  ],
  footerBlurb:
    'Shiriki is church management for African congregations: M-Pesa STK Push, PayBill, Airtel Money and USSD giving reconciled against your member register, plus events, communication and finance.',
  navLinks: [
    { _type: 'ctaLink', _key: key(), label: 'Features', href: '/#features', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'Pricing', href: '/pricing', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'About', href: '/about', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'Blog', href: '/blog', variant: 'ghost' },
  ],
  defaultSeo: {
    _type: 'seo',
    metaTitle: 'Shiriki | Church Management, Connected',
    metaDescription:
      'Church management for African congregations: M-Pesa STK Push, PayBill, Airtel Money and USSD giving reconciled against your member register, plus events, communication and finance.',
    noIndex: false,
  },
}

const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  heroEyebrow: 'Church management system for East Africa',
  heroHeadline: 'Church management that ',
  heroHeadlineHighlight: 'runs on M-Pesa.',
  heroSubheadline:
    'Members, giving, events, and finance in one system — with STK Push, PayBill, Airtel Money, and USSD gifts that match themselves to your member register.',
  // Was "Request a demo" pointing at `/demo`, a route this site does not have,
  // so the hero's link 404'd. The demo lives in a dialog the hero renders
  // itself; this slot is the scroll link into the giving section.
  heroPrimaryCta: { _type: 'cta', _key: key(), label: 'See how giving works', href: '/#giving', variant: 'primary' },
  heroSecondaryCta: { _type: 'cta', _key: key(), label: 'See pricing', href: '/pricing', variant: 'secondary' },
  // Left empty on purpose: this read "Trusted by churches across Kenya, Uganda
  // & Tanzania", a claim with no churches behind it. `heroEyebrow` renders in
  // its place until there is something true to put here.
  heroBadgeText: '',
  problemBandEyebrow: 'The problem',
  problemBandHeading: "Sunday's offering ends up in three places at once",
  problemBandIntro:
    'Most church management tools were never built with mobile money, USSD, or East African congregations in mind. Shiriki was.',
  problems: [
    {
      _type: 'problem',
      _key: key(),
      title: 'Giving is scattered',
      text: 'M-Pesa, cash, and bank deposits land in different places, and nobody has one true number.',
      icon: 'SplitSquareHorizontal',
    },
    {
      _type: 'problem',
      _key: key(),
      title: 'Member records live in Excel',
      text: 'Contact details, ministries, and attendance are scattered across spreadsheets that go stale.',
      icon: 'FileSpreadsheet',
    },
    {
      _type: 'problem',
      _key: key(),
      title: 'Communication is manual',
      text: 'Announcements get typed into a dozen WhatsApp groups by hand, every single week.',
      icon: 'MessageCircleWarning',
    },
  ],
  givingSectionHeading: 'Every gift lands in the same ledger',
  givingSectionIntro:
    'M-Pesa STK Push, PayBill, Airtel Money, card, or USSD — every gift lands in one reconciled ledger.',
  featuresSectionHeading: 'The welcome desk and the finance office, on the same records',
  featuresSectionIntro:
    'A visitor who signs in on Sunday becomes a member record, a giving history, and a follow-up task — without anyone retyping a name.',
  digitalHomeHeading: 'Announcements that reach the members without smartphones',
  digitalHomeIntro:
    'SMS, push, and email sent to one group, one ministry, or everyone who gave last month — plus event RSVPs, M-Pesa ticketing, and a sermon archive.',
  securityHeading: 'Members sign in with a phone number and a one-time code',
  securityIntro:
    'No passwords to forget, reuse, or leak. Every admin action is written to an audit log your treasurer and board can read.',
  // "Bank-grade encryption" says nothing, and "PCI DSS-compliant payments"
  // claimed a certification the platform does not hold — Paystack carries that
  // scope for card payments, not Shiriki. Both replaced with what is true.
  securityBadges: [
    { _type: 'securityBadge', _key: key(), icon: 'ShieldCheck', label: 'Encrypted in transit and at rest' },
    { _type: 'securityBadge', _key: key(), icon: 'Lock', label: 'Card payments handled by Paystack' },
    { _type: 'securityBadge', _key: key(), icon: 'DatabaseBackup', label: 'Daily automated backups' },
    { _type: 'securityBadge', _key: key(), icon: 'FileCheck2', label: 'Kenya Data Protection Act aligned' },
  ],
  ussdPanel: {
    eyebrow: 'USSD giving',
    code: '*710*12414#',
    body: 'Members can give, check pledges, and request statements by dialing this USSD code from any phone — no data bundle required.',
    cta: { _type: 'cta', _key: key(), label: 'See how USSD giving works', href: '/#giving', variant: 'ghost' },
  },
  seo: {
    _type: 'seo',
    metaTitle: 'Shiriki | Church Management, Connected',
    metaDescription:
      'Church management for African congregations: M-Pesa STK Push, PayBill, Airtel Money and USSD giving reconciled against your member register, plus events, communication and finance.',
    noIndex: false,
  },
}

const aboutPage = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  heading: 'Built for how African churches actually run',
  intro:
    'Shiriki started with a simple observation: church management software built for North America and Europe never quite fit East African congregations — mobile money, USSD, and multi-campus realities were always an afterthought.',
  mission: [
    block(
      'Our mission is to give every church in East Africa — from a fifty-member congregation in a market town to a multi-campus cathedral in Nairobi — the same quality of operational tools that large organizations take for granted.',
    ),
    block(
      'We believe a church office should spend less time reconciling M-Pesa statements and more time caring for its congregation. Every feature we build starts from that belief.',
    ),
  ],
  values: [
    {
      _type: 'value',
      _key: key(),
      title: 'Built for mobile money',
      description: 'M-Pesa, Airtel Money, and USSD are first-class citizens, not bolted-on integrations.',
      icon: 'Smartphone',
    },
    {
      _type: 'value',
      _key: key(),
      title: 'Simple enough for volunteers',
      description: 'Ushers, treasurers, and small group leaders can use it without weeks of training.',
      icon: 'Heart',
    },
    {
      _type: 'value',
      _key: key(),
      title: 'Trustworthy with sensitive data',
      description: 'Phone-and-OTP sign-in, per-church data isolation, and an audit log the board can read.',
      icon: 'ShieldCheck',
    },
  ],
  team: [ref(authorIds.shirikiTeam)],
  seo: {
    _type: 'seo',
    metaTitle: 'About Shiriki',
    metaDescription: 'Why we built Shiriki, and what we believe about church operations in East Africa.',
    noIndex: false,
  },
}

const pricingPage = {
  _id: 'pricingPage',
  _type: 'pricingPage',
  heading: 'Simple pricing, in Kenyan Shillings',
  intro:
    'Start with a 30-day free trial. Grow into the plan that fits your church — from a single congregation to a multi-campus diocese. No hidden fees, no markup on offerings.',
  plans: pricingPlans,
  comparisonNote:
    'All plans include M-Pesa giving support. Prices shown are in KES per month; annual billing is available at a discount (pay 10 months, get 12). Contact sales for churches with more than 2,000 members.',
  seo: {
    _type: 'seo',
    metaTitle: 'Pricing | Shiriki',
    metaDescription: 'Simple, transparent Shiriki pricing in Kenyan Shillings — from free to multi-campus.',
    noIndex: false,
  },
}

const legalPages = [
  {
    _id: 'legal-privacy',
    _type: 'legalPage',
    title: 'Privacy Policy',
    slug: { _type: 'slug', current: 'privacy' },
    lastUpdated: PRIVACY_POLICY_LAST_UPDATED,
    body: privacyPolicyBody,
    seo: {
      _type: 'seo',
      metaTitle: 'Privacy Policy | Shiriki',
      metaDescription:
        'What Shiriki collects from churches, members and givers, how it is used and shared, how long it is kept, and how to delete your account.',
      noIndex: false,
    },
  },
  {
    _id: 'legal-terms',
    _type: 'legalPage',
    title: 'Terms of Service',
    slug: { _type: 'slug', current: 'terms' },
    lastUpdated: '2026-08-01',
    body: [
      block(
        `These Terms of Service are an agreement between your church and ${DEVELOPER_NAME}, the developer and operator of Shiriki (“we”, “us”), and govern your church’s use of the Shiriki platform. By creating an account, your church agrees to these terms.`,
      ),
      h2('Use of the service'),
      block(
        'Shiriki is provided for the management of church membership, giving, communication, and events. Churches are responsible for the accuracy of data they enter.',
      ),
      h2('Payments'),
      block(
        'Giving processed through Shiriki is subject to the terms of the underlying payment provider (Safaricom M-Pesa, Airtel Money, or Paystack, as applicable).',
      ),
      h2('Termination'),
      block(
        'A church may cancel its subscription at any time. Upon cancellation, church data can be exported for a limited period before deletion.',
      ),
    ],
    seo: { _type: 'seo', metaTitle: 'Terms of Service | Shiriki', noIndex: false },
  },
]

// ---------------------------------------------------------------------------
// Sanity client (only built when the script runs)
// ---------------------------------------------------------------------------

// Load .env.local (tsx doesn't load Next.js env files automatically). No
// `dotenv` dependency is installed, so parse the minimal `KEY=VALUE` format
// ourselves rather than adding a new package dependency for this one script.
function loadDotEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function fail(message: string): never {
  console.error(`\n[seed] ${message}\n`)
  process.exit(1)
}

function createSeedClient() {
  loadDotEnvLocal()

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-01'
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId) {
    fail(
      'NEXT_PUBLIC_SANITY_PROJECT_ID is missing. Create a Sanity project, set ' +
        'the real project ID in .env.local, then re-run `pnpm seed`.',
    )
  }

  if (!token) {
    fail(
      'SANITY_API_WRITE_TOKEN is missing. Create a write-capable token in ' +
        'sanity.io/manage -> your project -> API -> Tokens (Editor or ' +
        'Administrator permissions) and add it to .env.local, then re-run `pnpm seed`.',
    )
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
  return { client, dataset, projectId }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function run() {
  const { client, dataset, projectId } = createSeedClient()

  // Order matters: referenced documents must exist before the documents
  // that reference them.
  const collections = [
    ...authors,
    ...categories,
    ...givingChannels,
    ...features,
    ...testimonials,
    ...faqDefs,
    ...posts,
    ...legalPages,
  ]

  const singletons = [siteSettings, homePage, aboutPage, pricingPage]

  const allDocs = [...collections, ...singletons]

  console.log(`[seed] Seeding ${allDocs.length} documents to dataset "${dataset}" (project ${projectId})...`)

  let count = 0
  for (const doc of allDocs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await client.createOrReplace(doc as any)
    count += 1
    console.log(`[seed] (${count}/${allDocs.length}) upserted ${doc._type} "${doc._id}"`)
  }

  console.log(`\n[seed] Done. ${count} documents created/updated.`)
  console.log('[seed] Open /studio to review or edit the seeded content.')
}

export {
  aboutPage,
  authors,
  categories,
  faqDefs as faqs,
  featureIds,
  features,
  givingChannelIds,
  givingChannels,
  homePage,
  planFlagBullets,
  posts,
  pricingPage,
  pricingPlans,
  siteSettings,
}

const isDirectRun = Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  run().catch((err) => {
    console.error('[seed] Failed:', err)
    process.exit(1)
  })
}
