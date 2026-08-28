/**
 * Seed script — creates the singletons and content documents for the
 * Kanisa Connect marketing site.
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

const testimonialIds = {
  gracePointNairobi: 'testimonial-grace-point-nairobi',
  cityChapelKampala: 'testimonial-city-chapel-kampala',
  upendoAssemblyArusha: 'testimonial-upendo-assembly-arusha',
}

const authorIds = {
  kanisaTeam: 'author-kanisa-connect-team',
}

const categoryIds = {
  giving: 'category-giving',
  operations: 'category-operations',
  growth: 'category-growth',
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
      'One accurate, searchable record per member and household — contact details, sacraments, ministries, and giving history in one place.',
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

const testimonials = [
  {
    _id: testimonialIds.gracePointNairobi,
    _type: 'testimonial',
    quote:
      'Kanisa Connect has brought order to how we manage giving. Our members love the M-Pesa STK Push, and our treasurer no longer spends Mondays reconciling paper records. Kweli, imetusaidia sana.',
    authorName: 'Pastor Daniel Mwangi',
    authorRole: 'Senior Pastor',
    churchName: 'Grace Point Chapel, Nairobi',
    order: 1,
  },
  {
    _id: testimonialIds.cityChapelKampala,
    _type: 'testimonial',
    quote:
      'We run three campuses across Kampala, and Kanisa Connect finally lets us see attendance and giving across all of them in one dashboard. It has changed how our leadership team plans.',
    authorName: 'Rev. Sarah Nakato',
    authorRole: 'Executive Pastor',
    churchName: 'City Chapel International, Kampala',
    order: 2,
  },
  {
    _id: testimonialIds.upendoAssemblyArusha,
    _type: 'testimonial',
    quote:
      'Wanachama wetu wengi hawana akaunti za benki, lakini wote wana simu. USSD imefanya michango kuwa rahisi kwa kila mtu, hata wale walio mashambani.',
    authorName: 'Elder Joseph Massawe',
    authorRole: 'Board Chairman',
    churchName: 'Upendo Assembly, Arusha',
    order: 3,
  },
]

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const faqDefs = [
  {
    question: 'How does Kanisa Connect support M-Pesa giving?',
    answer: [
      block(
        'Kanisa Connect supports both M-Pesa STK Push and a dedicated PayBill number. Members who give via STK Push get an instant prompt on their phone; PayBill gifts are matched to member records automatically using the phone number and account reference on the transaction.',
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
    question: 'Is our members’ data secure?',
    answer: [
      block(
        'All data is encrypted in transit and at rest, hosted on infrastructure that meets bank-grade security standards. Card payments are processed by a PCI DSS-compliant partner (Paystack), so your church never handles raw card details.',
      ),
    ],
    category: 'Security',
    order: 3,
  },
  {
    question: 'Do you support multiple campuses or branches?',
    answer: [
      block(
        'Yes. Kanisa Connect is built for multi-campus churches from the ground up — members, giving, and attendance can be tracked per campus and rolled up into a single view for church-wide leadership.',
      ),
    ],
    category: 'Operations',
    order: 4,
  },
  {
    question: 'How long does onboarding take?',
    answer: [
      block(
        'Most churches are live within a week. We help you import existing member records from Excel, set up your M-Pesa PayBill or Till number, and train your team — including your treasurer and ushers.',
      ),
    ],
    category: 'Getting started',
    order: 5,
  },
  {
    question: 'Can we export our data if we ever need to?',
    answer: [
      block(
        'Always. Member records, giving history, and attendance data can be exported to CSV or PDF at any time — your church’s data belongs to your church.',
      ),
    ],
    category: 'Operations',
    order: 6,
  },
  {
    question: 'Do you offer support in Swahili?',
    answer: [
      block(
        'Yes — our support team assists churches across East Africa in both English and Swahili, by phone, WhatsApp, and email.',
      ),
    ],
    category: 'Getting started',
    order: 7,
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
    _id: authorIds.kanisaTeam,
    _type: 'author',
    name: 'Kanisa Connect Team',
    slug: { _type: 'slug', current: 'kanisa-connect-team' },
    role: 'Editorial',
    bio: 'Notes and guides from the Kanisa Connect team on church operations, giving, and technology across East Africa.',
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
]

const postDefs = [
  {
    title: 'Why M-Pesa STK Push is changing tithing in Kenyan churches',
    slug: 'mpesa-stk-push-tithing-kenya',
    excerpt:
      'From cash offerings to instant mobile prompts — how STK Push is making it easier for congregations to give consistently, and for treasurers to reconcile it.',
    publishedAt: '2026-06-02T07:00:00Z',
    categoryId: categoryIds.giving,
    body: [
      h2('From envelopes to a phone prompt'),
      block(
        'For decades, giving in most East African churches meant a physical offering basket, a hand-written pledge card, or a trip to the bank on Monday morning. Mobile money changed that gradually — and STK Push is changing it again, this time instantly.',
      ),
      block(
        'STK Push lets a member enter an amount and immediately approve an M-Pesa prompt on their own phone, without leaving the service or the app they are using. The gift is recorded the moment it clears, matched automatically to the member’s profile.',
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
    body: [
      h2('The problem with paper attendance registers'),
      block(
        'As churches expand from a single sanctuary to multiple campuses — or even multiple services in one building — attendance tracking on paper quickly breaks down. Registers get lost, numbers get double-counted, and leadership loses the church-wide picture.',
      ),
      h3('A simpler approach'),
      bullets([
        'QR check-in at the door, scanned by ushers or self-service kiosks',
        'One dashboard showing attendance per campus, per service, and church-wide',
        'Automatic flags for members who have not attended in several weeks, for follow-up',
      ]),
      block(
        'The goal is not just a number for the board report — it is knowing, campus by campus, who is present, who is missing, and who might need a phone call this week.',
      ),
    ],
  },
  {
    title: 'Building a discipleship pathway your small groups will actually follow',
    slug: 'discipleship-pathway-small-groups',
    excerpt:
      'A clear, trackable path from new believer to small group leader — and how to see, at a glance, where every member is on that journey.',
    publishedAt: '2026-04-22T07:00:00Z',
    categoryId: categoryIds.growth,
    body: [
      h2('Discipleship needs a map, not just a Bible study'),
      block(
        'Most churches have a discipleship vision, but far fewer have a way to track whether members are actually moving through it. A pathway only works if leaders can see, at a glance, where each member stands.',
      ),
      h3('Four stages worth tracking'),
      bullets([
        'New believer — first steps and baptism',
        'Rooted — regular small group attendance',
        'Serving — active in a ministry team',
        'Leading — discipling others in a small group',
      ]),
      block(
        'When this is tracked per member rather than kept in a leader’s memory, follow-up becomes systematic instead of accidental — and growth becomes visible, not just hoped for.',
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
  author: { _type: 'reference', _ref: authorIds.kanisaTeam },
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
    priceKES: 0,
    period: 'month',
    description: 'For small congregations getting started with digital records and mobile giving.',
    features: [
      'Up to 150 members',
      'M-Pesa STK Push & USSD giving',
      'Basic attendance tracking',
      'Email support',
    ],
    highlighted: false,
    ctaLabel: 'Start free',
  },
  {
    _type: 'plan',
    _key: key(),
    name: 'Ukuaji',
    priceKES: 6500,
    period: 'month',
    description: 'For growing churches that need full giving reconciliation and communication tools.',
    features: [
      'Up to 1,500 members',
      'All giving channels (M-Pesa, Airtel Money, card, USSD)',
      'Bulk SMS & WhatsApp broadcasts',
      'Small groups & discipleship tracking',
      'Priority support',
    ],
    highlighted: true,
    ctaLabel: 'Talk to sales',
  },
  {
    _type: 'plan',
    _key: key(),
    name: 'Kanisa Kuu',
    period: 'custom',
    description: 'For multi-campus churches and dioceses that need church-wide reporting and dedicated support.',
    features: [
      'Unlimited members & campuses',
      'Church-wide reporting & dashboards',
      'Dedicated onboarding & training',
      'Custom integrations',
      'A dedicated account manager',
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
  name: 'Kanisa Connect',
  tagline: 'Church operations, beautifully connected.',
  contactEmail: 'hello@kanisaconnect.com',
  salesEmail: 'sales@kanisaconnect.com',
  phone: '+254 700 000 000',
  ussdCode: '*710*13414#',
  address: {
    streetAddress: 'Westlands',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  socialLinks: [
    { _type: 'socialLink', _key: key(), platform: 'x', url: 'https://x.com/kanisaconnect' },
    {
      _type: 'socialLink',
      _key: key(),
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/kanisaconnect',
    },
    { _type: 'socialLink', _key: key(), platform: 'facebook', url: 'https://www.facebook.com/kanisaconnect' },
    { _type: 'socialLink', _key: key(), platform: 'youtube', url: 'https://www.youtube.com/@kanisaconnect' },
  ],
  footerBlurb:
    'Kanisa Connect is the complete church management platform for African churches — M-Pesa giving, member records, communication, events, and finance in one connected home.',
  navLinks: [
    { _type: 'ctaLink', _key: key(), label: 'Features', href: '/#features', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'Pricing', href: '/pricing', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'About', href: '/about', variant: 'ghost' },
    { _type: 'ctaLink', _key: key(), label: 'Blog', href: '/blog', variant: 'ghost' },
  ],
  defaultSeo: {
    _type: 'seo',
    metaTitle: 'Kanisa Connect | Church Management, Connected',
    metaDescription:
      'The complete church management platform for African churches — M-Pesa giving, member records, communication, events, and finance in one connected home.',
    noIndex: false,
  },
}

const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  heroEyebrow: 'Church management for East Africa',
  heroHeadline: 'Church operations, beautifully connected.',
  heroSubheadline:
    'Kanisa Connect brings member records, M-Pesa giving, communication, and events into one connected home — built for how African churches actually run.',
  heroPrimaryCta: { _type: 'cta', _key: key(), label: 'Request a demo', href: '/demo', variant: 'primary' },
  heroSecondaryCta: { _type: 'cta', _key: key(), label: 'See pricing', href: '/pricing', variant: 'secondary' },
  heroBadgeText: 'Trusted by churches across Kenya, Uganda & Tanzania',
  problemBandEyebrow: 'The problem',
  problemBandHeading: 'Running a church still means juggling spreadsheets, WhatsApp groups, and cash counts',
  problemBandIntro:
    'Most church management tools were never built with mobile money, USSD, or East African congregations in mind. Kanisa Connect was.',
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
  givingSectionHeading: 'Every giving channel your members already use',
  givingSectionIntro:
    'M-Pesa STK Push, PayBill, Airtel Money, card, or USSD — every gift lands in one reconciled ledger.',
  featuresSectionHeading: 'Everything your church office needs, in one place',
  featuresSectionIntro:
    'From member records to reporting, Kanisa Connect replaces the spreadsheets and paper registers with one connected system.',
  digitalHomeHeading: 'A digital home for your whole congregation',
  digitalHomeIntro:
    'Members check their giving history, register for events, and stay connected to their small group — right from their phone.',
  securityHeading: 'Built on bank-grade security',
  securityIntro:
    'Your members’ data and gifts are protected by the same standards banks and mobile money providers rely on.',
  securityBadges: [
    { _type: 'securityBadge', _key: key(), icon: 'ShieldCheck', label: 'Bank-grade encryption' },
    { _type: 'securityBadge', _key: key(), icon: 'Lock', label: 'PCI DSS-compliant payments' },
    { _type: 'securityBadge', _key: key(), icon: 'DatabaseBackup', label: 'Daily automated backups' },
    { _type: 'securityBadge', _key: key(), icon: 'FileCheck2', label: 'Kenya Data Protection Act aligned' },
  ],
  ussdPanel: {
    eyebrow: 'No smartphone? No problem.',
    code: '*710*13414#',
    body: 'Members can give, check pledges, and request statements by dialing this USSD code from any phone — no data bundle required.',
    cta: { _type: 'cta', _key: key(), label: 'See how USSD giving works', href: '/#giving', variant: 'ghost' },
  },
  seo: {
    _type: 'seo',
    metaTitle: 'Kanisa Connect | Church Management, Connected',
    metaDescription:
      'The complete church management platform for African churches — M-Pesa giving, member records, communication, events, and finance in one connected home.',
    noIndex: false,
  },
}

const aboutPage = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  heading: 'Built for how African churches actually run',
  intro:
    'Kanisa Connect started with a simple observation: church management software built for North America and Europe never quite fit East African congregations — mobile money, USSD, and multi-campus realities were always an afterthought.',
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
      description: 'Member and giving data is protected with the same rigor as a bank.',
      icon: 'ShieldCheck',
    },
  ],
  team: [ref(authorIds.kanisaTeam)],
  seo: {
    _type: 'seo',
    metaTitle: 'About Kanisa Connect',
    metaDescription: 'Why we built Kanisa Connect, and what we believe about church operations in East Africa.',
    noIndex: false,
  },
}

const pricingPage = {
  _id: 'pricingPage',
  _type: 'pricingPage',
  heading: 'Simple pricing, in Kenyan Shillings',
  intro:
    'Start free with a small congregation, or grow into a plan built for multi-campus churches. No hidden fees on giving reconciliation.',
  plans: pricingPlans,
  comparisonNote:
    'All plans include M-Pesa giving support. Prices shown are in KES per month; annual billing is available at a discount. Contact sales for churches with more than 5,000 members.',
  seo: {
    _type: 'seo',
    metaTitle: 'Pricing | Kanisa Connect',
    metaDescription: 'Simple, transparent Kanisa Connect pricing in Kenyan Shillings — from free to multi-campus.',
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
        'This Privacy Policy explains how Kanisa Connect collects, uses, and protects information about churches, church staff, and congregation members who use our platform.',
      ),
      h2('Information we collect'),
      bullets([
        'Account information for church administrators and staff',
        'Member records entered by the church (contact details, ministries, attendance)',
        'Giving records processed through supported payment channels',
      ]),
      h2('How we use it'),
      block(
        'Information is used solely to provide the Kanisa Connect service to the church that entered it. We do not sell member or giving data to third parties.',
      ),
      h2('Data security'),
      block(
        'Data is encrypted in transit and at rest. Card payments are processed by PCI DSS-compliant partners; Kanisa Connect never stores raw card numbers.',
      ),
    ],
    seo: { _type: 'seo', metaTitle: 'Privacy Policy | Kanisa Connect', noIndex: false },
  },
  {
    _id: 'legal-terms',
    _type: 'legalPage',
    title: 'Terms of Service',
    slug: { _type: 'slug', current: 'terms' },
    lastUpdated: '2026-08-01',
    body: [
      block(
        'These Terms of Service govern your church’s use of the Kanisa Connect platform. By creating an account, your church agrees to these terms.',
      ),
      h2('Use of the service'),
      block(
        'Kanisa Connect is provided for the management of church membership, giving, communication, and events. Churches are responsible for the accuracy of data they enter.',
      ),
      h2('Payments'),
      block(
        'Giving processed through Kanisa Connect is subject to the terms of the underlying payment provider (Safaricom M-Pesa, Airtel Money, or Paystack, as applicable).',
      ),
      h2('Termination'),
      block(
        'A church may cancel its subscription at any time. Upon cancellation, church data can be exported for a limited period before deletion.',
      ),
    ],
    seo: { _type: 'seo', metaTitle: 'Terms of Service | Kanisa Connect', noIndex: false },
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
