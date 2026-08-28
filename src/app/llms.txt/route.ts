import { SITE_URL } from '@/lib/site'
import { FALLBACK_FAQS } from '@/lib/fallback-content'
import { sanityFetch } from '@/sanity/lib/fetch'
import { typeTag } from '@/sanity/lib/live'
import { allContentForLlmsQuery } from '@/sanity/lib/queries'

/**
 * /llms.txt — a Markdown overview of the site for AI crawlers, following the
 * llms.txt convention: an H1, a one-line blockquote summary, then link-list
 * sections. Static marketing pages are always listed (they're always
 * present, CMS or not); blog posts and FAQs are appended live from Sanity
 * when configured.
 *
 * With no live data, sections with no CMS items are simply omitted — the
 * file stays valid Markdown (H1 + summary + Pages + Contact).
 */
export const revalidate = 3600

type LlmsPost = {
  title: string
  slug: string
  excerpt?: string | null
}

type LlmsFaq = {
  question: string
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

function link(title: string, path: string, desc?: string | null): string {
  const clean = desc?.replace(/\s+/g, ' ').trim()
  return clean ? `- [${title}](${url(path)}): ${clean}` : `- [${title}](${url(path)})`
}

function section(heading: string, lines: string[]): string {
  if (lines.length === 0) return ''
  return `## ${heading}\n\n${lines.join('\n')}\n`
}

const PAGES = [
  { title: 'Home', path: '/', desc: 'Church management platform overview — giving, members, communication, events, and finance.' },
  { title: 'About', path: '/about', desc: 'About Shiriki and its mission for African churches.' },
  { title: 'Pricing', path: '/pricing', desc: 'Plans and pricing in Kenyan Shillings.' },
  { title: 'Blog', path: '/blog', desc: 'Articles on church operations, giving, and community.' },
  { title: 'FAQ', path: '/faq', desc: 'Frequently asked questions about Shiriki.' },
  { title: 'Contact', path: '/contact', desc: 'Get in touch or request a demo.' },
]

export async function GET() {
  const data = await sanityFetch<AllContentForLlms, AllContentForLlms>(
    allContentForLlmsQuery,
    {},
    { next: { tags: [typeTag('post'), typeTag('faq')] } },
    EMPTY,
  )

  const sections = [
    section(
      'Pages',
      PAGES.map((page) => link(page.title, page.path, page.desc)),
    ),
    section(
      'Blog',
      data.posts
        .filter((post) => Boolean(post?.slug))
        .map((post) => link(post.title, `/blog/${post.slug}`, post.excerpt)),
    ),
    section(
      'FAQ',
      data.faqs.map((faq) => `- ${faq.question}`),
    ),
    section('Contact', [
      link('Contact Shiriki', '/contact', 'Sales, support, and demo requests.'),
    ]),
  ].filter(Boolean)

  const body = [
    '# Shiriki',
    '',
    '> Shiriki is a church management platform for African churches — member records, communication, events, and finance, with mobile giving via M-Pesa and Airtel Money, all in one connected home.',
    '',
    `Website: ${url('/')}`,
    '',
    sections.join('\n'),
  ].join('\n')

  return new Response(`${body.trimEnd()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
