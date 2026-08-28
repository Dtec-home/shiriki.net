import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { SanityImageSource } from '@sanity/image-url'
import { AuthorByline } from '@/components/blog/author-byline'
import { urlFor } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'

type PostCardImage = { asset?: unknown; alt?: string } | null

type PostCardAuthor = { name: string; avatar?: SanityImageSource | null } | null

type PostCardCategory = { _id: string; title: string }

export type PostCardPost = {
  title: string
  slug: { current: string } | null
  excerpt?: string | null
  coverImage?: PostCardImage
  author?: PostCardAuthor
  categories?: PostCardCategory[] | null
  publishedAt: string
}

export type PostCardProps = {
  post: PostCardPost
  readingTime?: string
  /** Two-column featured layout for the single featured post atop the blog index. */
  featured?: boolean
  className?: string
}

/** Blog post card: cover image, category + read-time eyebrow, `<h3>` title, excerpt, byline. */
export function PostCard({ post, readingTime, featured = false, className }: PostCardProps) {
  const slug = post.slug?.current
  if (!slug) return null

  const href = `/blog/${slug}`
  const category = post.categories?.[0]
  const eyebrow = [category?.title, readingTime].filter(Boolean).join(' · ')
  const cover = post.coverImage?.asset
    ? urlFor(post.coverImage as SanityImageSource)
        .width(featured ? 1200 : 720)
        .height(featured ? 720 : 480)
        .fit('crop')
        .url()
    : null
  const coverAlt = post.coverImage?.alt || post.title

  return (
    <article
      className={cn(
        'group flex overflow-hidden rounded-2xl border bg-card shadow-brand-sm transition-shadow hover:shadow-brand-md',
        featured ? 'flex-col md:grid md:grid-cols-[1.2fr_1fr] md:items-stretch' : 'flex-col',
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={coverAlt}
            fill
            sizes={featured ? '(min-width: 768px) 55vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Kanisa Connect
          </span>
        )}
      </Link>

      <div className={cn('flex flex-1 flex-col gap-3 p-6', featured && 'md:justify-center md:p-8')}>
        {eyebrow ? <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</span> : null}
        <h3 className={cn('font-bold leading-tight', featured ? 'text-2xl' : 'text-xl')}>
          <Link href={href} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className={cn('text-muted-foreground', featured ? 'text-base' : 'text-sm line-clamp-3')}>{post.excerpt}</p>
        ) : null}

        <div className="mt-auto flex flex-col gap-4 pt-2">
          {post.author?.name ? (
            <AuthorByline name={post.author.name} photo={post.author.avatar} publishedAt={post.publishedAt} avatarSize={32} />
          ) : null}
          <Link href={href} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" aria-label={`Read ${post.title}`}>
            Read article
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
