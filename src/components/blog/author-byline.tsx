import Image from 'next/image'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import type { SanityImageSource } from '@sanity/image-url'

export type AuthorBylineProps = {
  name: string | null | undefined
  role?: string | null
  photo?: SanityImageSource | null
  /** ISO date string (post.publishedAt). */
  publishedAt?: string | null
  /** Reading-time label, e.g. "4 min read". */
  readingTime?: string
  /** px size of the avatar. Defaults to 40 (post header uses 40, bio uses 52). */
  avatarSize?: number
  centered?: boolean
  className?: string
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Avatar + name + role/date/reading-time byline used on post cards and post headers. */
export function AuthorByline({
  name,
  role,
  photo,
  publishedAt,
  readingTime,
  avatarSize = 40,
  centered = false,
  className,
}: AuthorBylineProps) {
  const date = formatDate(publishedAt)
  const meta = [role, date, readingTime].filter(Boolean) as string[]

  return (
    <div className={cn('flex items-center gap-3', centered && 'justify-center text-center', className)}>
      {photo ? (
        <Image
          src={urlFor(photo).width(avatarSize * 2).height(avatarSize * 2).fit('crop').url()}
          alt={name ? name : 'Author'}
          width={avatarSize}
          height={avatarSize}
          className="rounded-full object-cover"
        />
      ) : (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase text-muted-foreground"
          style={{ width: avatarSize, height: avatarSize }}
          aria-hidden="true"
        >
          {name ? name.charAt(0) : '·'}
        </span>
      )}
      <div className={cn('flex flex-col', centered && 'items-center')}>
        {name ? <span className="text-sm font-semibold leading-tight">{name}</span> : null}
        {meta.length > 0 ? <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{meta.join(' · ')}</span> : null}
      </div>
    </div>
  )
}
