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
 */

import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// `next-sanity` re-exports `createClient` from `@sanity/client`. It's used
// here (rather than depending on `@sanity/client` directly) because it's
// already a project dependency with resolvable types.
import { createClient } from 'next-sanity'

// Load .env.local (tsx doesn't load Next.js env files automatically). No
// `dotenv` dependency is installed, so parse the minimal `KEY=VALUE` format
// ourselves rather than adding a new package dependency for this one script.
loadDotEnvLocal()

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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-01'
const token = process.env.SANITY_API_WRITE_TOKEN

function fail(message: string): never {
  console.error(`\n[seed] ${message}\n`)
  process.exit(1)
}

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

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

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
  communication: 'feature-communication',
  eventsAttendance: 'feature-events-attendance',
  smallGroups: 'feature-small-groups',
  reportsInsights: 'feature-reports-insights',
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
      'A dedicated PayBill number for your church. Members who prefer to give through the M-Pesa menu are matched and reconciled automatically.',
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
      'No smartphone or data bundle required. Members dial *710*13414# from any phone to give, check pledges, or request a statement.',
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
    _id: featureIds.communication,
    _type: 'feature',
    title: 'Communication',
    description:
      'Reach the whole congregation or a single small group with SMS, WhatsApp, and email — segmented by ministry, department, or campus.',
    icon: 'MessageCircle',
    bullets: ['Bulk SMS with delivery reports', 'WhatsApp broadcast lists', 'Scheduled reminders for events'],
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
        'Yes. Members can dial *710*13414# from any phone — smartphone or not — to give, check their pledge balance, or request a statement. No data bundle is required.',
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
  // ---------- Pricing ----------
  {
    question: 'Is there a free trial?',
    answer: [
      block(
        'Yes. Every church starts with a 30-day free trial on the Msingi plan — M-Pesa STK Push giving, USSD giving, a member directory, attendance tracking, and 100 SMS included. No payment required to start.',
      ),
    ],
    category: 'Pricing',
    order: 6,
  },
  {
    question: 'What happens after the 30-day free trial?',
    answer: [
      block(
        'After 30 days, your church moves to the Msingi paid plan at KES 2,000 per month. You can upgrade to Ukuaji or Kanisa at any time — all your data, giving history, and member records carry over with zero downtime.',
      ),
    ],
    category: 'Pricing',
    order: 7,
  },
  {
    question: 'Do you charge a percentage on M-Pesa giving?',
    answer: [
      block(
        'We never add a markup on top of Safaricom\'s or Airtel\'s standard mobile money charges. Your church keeps 100% of every contribution, minus only the telco\'s standard transaction fee. Our revenue comes from the platform subscription, not from your offerings.',
      ),
    ],
    category: 'Pricing',
    order: 8,
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: [
      block(
        'Yes. Pay for 10 months upfront and get 12 months of access — that is roughly a 17% discount. Annual billing is available on Msingi, Ukuaji, and Kanisa plans, payable via M-Pesa or card.',
      ),
    ],
    category: 'Pricing',
    order: 9,
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
    order: 10,
  },
  {
    question: 'Are you compliant with the Kenya Data Protection Act?',
    answer: [
      block(
        'Yes. Shiriki is designed in alignment with the Kenya Data Protection Act (2019) and the guidelines issued by the Office of the Data Protection Commissioner (ODPC). Member data is processed solely for the purpose of church management, is never sold to third parties, and can be exported or deleted at the church\'s request.',
      ),
    ],
    category: 'Security',
    order: 11,
  },
  {
    question: 'Who can access our church\'s data?',
    answer: [
      block(
        'Only administrators your church has authorised. Shiriki uses role-based access control — you decide who can see member records, giving data, financial reports, and HR information. Each admin role has specific permissions, so your ushers do not see payroll and your treasurer does not manage events.',
      ),
    ],
    category: 'Security',
    order: 12,
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
    order: 13,
  },
  {
    question: 'Can we run payroll for our church staff?',
    answer: [
      block(
        'Yes, on the Kanisa plan and above. The payroll module calculates Kenyan statutory deductions — PAYE with personal relief, NSSF Tier I and Tier II, and SHIF — automatically each month. Payslips are generated for every staff member.',
      ),
    ],
    category: 'Operations',
    order: 14,
  },
  {
    question: 'Can we export our data if we ever need to?',
    answer: [
      block(
        'Always. Member records, giving history, attendance data, and financial reports can be exported to CSV, Excel, or PDF at any time — your church\'s data belongs to your church. On the Shirikisho plan, we also provide a full data portability guarantee.',
      ),
    ],
    category: 'Operations',
    order: 15,
  },
  {
    question: 'How does the SMS allocation work?',
    answer: [
      block(
        'Each plan includes a monthly SMS allocation: 100 for Msingi, 200 for Ukuaji, and 500 for Kanisa. Unused SMS do not roll over. If you need more in a given month, you can top up at KES 0.70–0.80 per SMS depending on your plan. Automated giving receipts are included and do not count against your allocation.',
      ),
    ],
    category: 'Operations',
    order: 16,
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
    order: 17,
  },
  {
    question: 'Can we import our existing member records?',
    answer: [
      block(
        'Yes. Shiriki supports bulk member import from Excel (CSV or .xlsx). Upload your existing spreadsheet, map the columns to Shiriki fields, and your member directory is populated in minutes — including departments, groups, and contact details.',
      ),
    ],
    category: 'Getting started',
    order: 18,
  },
  {
    question: 'Do you offer support in Swahili?',
    answer: [
      block(
        'Yes — our support team assists churches across East Africa in both English and Swahili, by phone, WhatsApp, and email. The Shiriki app itself is also available in Kiswahili, and we are adding more local languages.',
      ),
    ],
    category: 'Getting started',
    order: 19,
  },
  {
    question: 'What do we need to get started?',
    answer: [
      block(
        'Just a phone number and an internet connection. Sign up at shiriki.site, choose your church\'s subdomain, and you are in the 30-day free trial immediately. To receive M-Pesa giving, you will need your own Safaricom PayBill or Till number and the Daraja API credentials — our setup wizard walks you through obtaining these.',
      ),
    ],
    category: 'Getting started',
    order: 20,
  },
  {
    question: 'Can we switch from another church management tool?',
    answer: [
      block(
        'Yes. We have helped churches migrate from spreadsheets, Churchtools, Breeze, and other platforms. Export your member data as a CSV from your current system, and use our bulk import to bring it into Shiriki. Giving history can also be imported. Contact our support team if you need help with migration.',
      ),
    ],
    category: 'Getting started',
    order: 21,
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
        'Run a test STK Push contribution from your own phone. If it arrives in the ledger matched to your member profile, you are live. Share the USSD code *710*13414# with your congregation and announce it from the pulpit on Sunday.',
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
    title: 'USSD giving: how *710*13414# reaches the members no app can',
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
        'USSD bridges this gap. By dialling *710*13414# from any phone, a member enters a simple menu-driven flow: choose a church, select a department, enter an amount, and confirm with their M-Pesa PIN. No data, no app, no smartphone.',
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
        'Best for a small fellowship, home church, or new plant with under 150 members. You get M-Pesa STK Push and USSD giving, a member directory, basic attendance, 100 SMS per month, and one admin login. Start with a 30-day free trial, then KES 2,000 per month.',
      ),
      h3('Ukuaji: growth mode'),
      block(
        'Best for a growing urban or peri-urban church between 150 and 500 members that needs all giving channels (including PayBill, Airtel Money, and card), up to 5 admin roles, events, email notifications, financial reports, and 200 SMS. KES 3,500 per month.',
      ),
      h3('Kanisa: the full church office'),
      block(
        'Best for an established church between 500 and 2,000 members with salaried staff, a finance committee, and possibly 2\u20133 branches. Adds unlimited admin roles, double-entry accounting, budgets, expense claims, HR, Kenyan payroll (PAYE/NSSF/SHIF), paid ticketing, YouTube sermon sync, push notifications, and 500 SMS. KES 7,500 per month.',
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
  ussdCode: '*710*13414#',
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
  heroEyebrow: 'Church management for East Africa',
  heroHeadline: 'Church management that runs on M-Pesa.',
  heroSubheadline:
    'Members, giving, events, and finance in one system — with STK Push, PayBill, Airtel Money, and USSD gifts that match themselves to your member register.',
  heroPrimaryCta: { _type: 'cta', _key: key(), label: 'Request a demo', href: '/demo', variant: 'primary' },
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
    code: '*710*13414#',
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
    lastUpdated: '2026-08-01',
    body: [
      block(
        'This Privacy Policy explains how Shiriki collects, uses, and protects information about churches, church staff, and congregation members who use our platform.',
      ),
      h2('Information we collect'),
      bullets([
        'Account information for church administrators and staff',
        'Member records entered by the church (contact details, ministries, attendance)',
        'Giving records processed through supported payment channels',
      ]),
      h2('How we use it'),
      block(
        'Information is used solely to provide the Shiriki service to the church that entered it. We do not sell member or giving data to third parties.',
      ),
      h2('Data security'),
      block(
        'Data is encrypted in transit and at rest. Card payments are processed by PCI DSS-compliant partners; Shiriki never stores raw card numbers.',
      ),
    ],
    seo: { _type: 'seo', metaTitle: 'Privacy Policy | Shiriki', noIndex: false },
  },
  {
    _id: 'legal-terms',
    _type: 'legalPage',
    title: 'Terms of Service',
    slug: { _type: 'slug', current: 'terms' },
    lastUpdated: '2026-08-01',
    body: [
      block(
        'These Terms of Service govern your church’s use of the Shiriki platform. By creating an account, your church agrees to these terms.',
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
// Run
// ---------------------------------------------------------------------------

async function run() {
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

run().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
