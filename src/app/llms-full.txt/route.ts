import { portableTextToPlain } from '@/lib/portable-text-to-plain'
import { SITE_URL } from '@/lib/site'
import { FALLBACK_FAQS } from '@/lib/fallback-content'
import { sanityFetch } from '@/sanity/lib/fetch'
import { typeTag } from '@/sanity/lib/live'
import { allContentForLlmsQuery } from '@/sanity/lib/queries'

/**
 * /llms-full.txt — an expanded llms.txt that inlines full plain-text copy:
 * every static page's summary, every FAQ (question + flattened answer), and
 * every blog post's full body (flattened from Portable Text). Entries are
 * separated by `---` with `### Title` / `URL:` headers for easy parsing.
 *
 * Pulled live from Sanity where configured; falls back to just the static
 * page inventory (still valid, non-empty output) when it isn't.
 */
export const revalidate = 3600

type LlmsPost = {
  title: string
  slug: string
  excerpt?: string | null
  body?: unknown
  publishedAt?: string | null
  updatedAt?: string | null
}

type LlmsFaq = {
  question: string
  answer?: unknown
}

type AllContentForLlms = {
  posts: LlmsPost[]
  faqs: LlmsFaq[]
}

// With no Sanity project configured the pages still render a full FAQ from
// `FALLBACK_FAQS`; the AEO routes must advertise the same content rather
// than an empty site. Posts have no hardcoded equivalent, so they stay [].
const EMPTY: AllContentForLlms = { posts: [], faqs: FALLBACK_FAQS }

function url(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function entry(title: string, path: string, lines: (string | null | undefined)[]): string {
  const body = lines
    .map((line) => line?.replace(/[ \t]+/g, ' ').trim())
    .filter((line): line is string => Boolean(line))
  return [`### ${title}`, `URL: ${url(path)}`, '', ...body].join('\n')
}

const PAGES: { title: string; path: string; summary: string }[] = [
  {
    title: 'Home',
    path: '/',
    summary:
      'Kanisa Connect is a church management platform for African churches: member records, communication, events, and finance, with mobile giving via M-Pesa and Airtel Money — all in one connected home.',
  },
  {
    title: 'About',
    path: '/about',
    summary: 'About Kanisa Connect and its mission to give African churches a beautifully connected digital home.',
  },
  {
    title: 'Pricing',
    path: '/pricing',
    summary: 'Kanisa Connect plans are priced in Kenyan Shillings (KES), with flexible tiers for churches of every size.',
  },
  {
    title: 'Contact',
    path: '/contact',
    summary: 'Reach the Kanisa Connect team for sales, support, or to request a demo.',
  },
  {
    title: 'Privacy Policy',
    path: '/privacy',
    summary: 'How Kanisa Connect collects, uses, and protects member and church data.',
  },
  {
    title: 'Terms of Service',
    path: '/terms',
    summary: 'The terms governing use of the Kanisa Connect platform.',
  },
]

export async function GET() {
  const data = await sanityFetch<AllContentForLlms, AllContentForLlms>(
    allContentForLlmsQuery,
    {},
    { next: { tags: [typeTag('post'), typeTag('faq')] } },
    EMPTY,
  )

  const blocks: string[] = [
    '# Kanisa Connect — Full content for AI ingestion',
    '',
    '> Kanisa Connect is a church management platform for African churches — member records, communication, events, and finance, with mobile giving via M-Pesa and Airtel Money, all in one connected home.',
    '',
    `Website: ${url('/')}`,
    '',
  ]

  const pushSection = (heading: string, items: string[]) => {
    if (items.length === 0) return
    blocks.push(`## ${heading}`, '', items.join('\n\n---\n\n'), '')
  }

  pushSection(
    'Pages',
    PAGES.map((page) => entry(page.title, page.path, [page.summary])),
  )

  pushSection(
    'FAQ',
    data.faqs.map((faq, index) =>
      entry(faq.question, '/faq', [portableTextToPlain(faq.answer) || null]).replace(
        '### ' + faq.question,
        `### FAQ ${index + 1}: ${faq.question}`,
      ),
    ),
  )

  pushSection(
    'Blog',
    data.posts
      .filter((post) => Boolean(post?.slug))
      .map((post) =>
        entry(post.title, `/blog/${post.slug}`, [
          post.excerpt,
          post.publishedAt ? `Published: ${post.publishedAt}` : null,
          portableTextToPlain(post.body),
        ]),
      ),
  )

  return new Response(`${blocks.join('\n').trimEnd()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
