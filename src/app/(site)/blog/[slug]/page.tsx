import type { Metadata } from 'next'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import type { SanityImageSource } from '@sanity/image-url'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { AuthorByline } from '@/components/blog/author-byline'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { Skeleton } from '@/components/ui/skeleton'
import { CtaBand } from '@/components/sections/cta-band'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMetadata } from '@/lib/metadata'
import { articleSchema, breadcrumbSchema } from '@/lib/json-ld'
import { readingTimeLabel } from '@/lib/reading-time'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/fetch'
import { slugTag, typeTag } from '@/sanity/lib/live'
import { postBySlugQuery, postSlugsQuery } from '@/sanity/lib/queries'

/**
 * Below-the-fold, interaction-gated (Web Share API / copy-to-clipboard) —
 * code-split into its own chunk rather than the main article bundle. `ssr`
 * stays at its default (true) since `next/dynamic(..., { ssr: false })` is
 * not permitted inside a Server Component; SSR output is unaffected either
 * way, only the client hydration chunk is split off.
 */
const ShareButtons = dynamic(() => import('@/components/blog/share-buttons').then((m) => m.ShareButtons), {
  loading: () => (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-16" />
      <Skeleton className="h-9 w-28" />
    </div>
  ),
})

type PostDetail = {
  title: string
  excerpt?: string | null
  coverImage?: { asset?: unknown; alt?: string } | null
  author?: { name: string; role?: string | null; avatar?: SanityImageSource | null; bio?: string | null } | null
  publishedAt: string
  body?: ReadonlyArray<unknown> | null
} | null

export async function generateStaticParams() {
  // postSlugsQuery projects `.slug.current` directly, so it resolves to a
  // plain array of slug strings (not objects).
  const slugs = await sanityFetch<string[], string[]>(postSlugsQuery, {}, { next: { tags: [typeTag('post')] } }, [])
  return slugs.map((slug) => ({ slug }))
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<PostDetail, null>(
    postBySlugQuery,
    { slug },
    { next: { tags: [typeTag('post'), slugTag('post', slug)] } },
    null,
  )
  if (!post) return {}
  return buildMetadata({
    title: post.title,
    description: post.excerpt ?? undefined,
    path: `/blog/${slug}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await sanityFetch<PostDetail, null>(
    postBySlugQuery,
    { slug },
    { next: { tags: [typeTag('post'), slugTag('post', slug)] } },
    null,
  )

  if (!post) {
    notFound()
  }

  const readingTime = readingTimeLabel(post.body)
  const cover = post.coverImage?.asset
    ? urlFor(post.coverImage as SanityImageSource).width(1600).height(900).fit('crop').url()
    : null

  const articleLd = articleSchema({
    title: post.title,
    description: post.excerpt ?? undefined,
    path: `/blog/${slug}`,
    authorName: post.author?.name,
    publishedAt: post.publishedAt,
    imageUrl: cover ?? undefined,
  })
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ])

  return (
    <article className="flex flex-col">
      <JsonLd data={[articleLd, breadcrumbLd]} />

      <Container size="prose" as="div" className="flex flex-col items-center gap-6 py-16 text-center md:pt-24">
        <Reveal className="flex flex-col items-center gap-6">
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">
            {post.title}
          </h1>
          {post.author?.name ? (
            <AuthorByline
              name={post.author.name}
              role={post.author.role}
              photo={post.author.avatar}
              publishedAt={post.publishedAt}
              readingTime={readingTime}
              centered
            />
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{readingTime}</span>
          )}
        </Reveal>
      </Container>

      {cover ? (
        <Container size="wide" as="div" className="mb-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={cover}
              alt={post.coverImage?.alt || post.title}
              fill
              priority
              sizes="(min-width: 1320px) 1320px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container size="prose" as="div" className="pb-12">
        <SectionErrorBoundary label="PostBody">
          <PortableTextRenderer value={post.body} />
        </SectionErrorBoundary>
        <div className="mt-12 flex flex-col gap-6 border-t pt-6">
          <ShareButtons url={`/blog/${slug}`} title={post.title} />
        </div>
      </Container>

      {post.author?.bio ? (
        <Container size="prose" as="div" className="pb-12">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-start">
            <AuthorByline name={post.author.name} role={post.author.role} photo={post.author.avatar} avatarSize={52} />
            <p className="text-sm leading-relaxed text-muted-foreground sm:border-l sm:pl-6">{post.author.bio}</p>
          </div>
        </Container>
      ) : null}

      <CtaBand
        heading="Have a project in mind?"
        sub="Talk to our team about giving, membership, and communication for your church."
        ctaLabel="Talk to our team"
      />
    </article>
  )
}
