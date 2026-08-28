import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { PortableText, type PortableTextComponents, type PortableTextMarkComponentProps } from '@portabletext/react'
import type { SanityImageSource } from '@sanity/image-url'
import { CodeBlock } from '@/components/blog/code-block'
import { urlFor } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'

type LinkValue = { _type: 'link'; href: string; blank?: boolean }

function LinkMark({ value, children }: PortableTextMarkComponentProps<LinkValue>) {
  const href = value?.href
  if (!href) return <>{children}</>

  const className = 'text-primary underline decoration-1 underline-offset-[3px]'
  const external = /^https?:/.test(href)

  if (value?.blank || external) {
    return (
      <a href={href} className={className} {...(value?.blank || external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

type CalloutValue = { tone?: 'info' | 'success' | 'warning'; text?: string }

const CALLOUT_STYLES: Record<'info' | 'success' | 'warning', { wrapper: string; icon: typeof Info; iconColor: string }> = {
  info: { wrapper: 'border-primary/20 bg-accent text-accent-foreground', icon: Info, iconColor: 'text-primary' },
  success: { wrapper: 'border-border bg-secondary/20 text-foreground', icon: CheckCircle2, iconColor: 'text-primary' },
  warning: { wrapper: 'border-destructive/30 bg-destructive/10 text-foreground', icon: TriangleAlert, iconColor: 'text-destructive' },
}

function Callout({ value }: { value: CalloutValue }) {
  const tone = value?.tone ?? 'info'
  const { wrapper, icon: Icon, iconColor } = CALLOUT_STYLES[tone] ?? CALLOUT_STYLES.info
  return (
    <div className={cn('my-6 flex gap-3 rounded-xl border p-4', wrapper)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor)} aria-hidden="true" />
      <p className="text-base leading-relaxed">{value?.text}</p>
    </div>
  )
}

type QuoteBlockValue = { quote?: string; attribution?: string }

function QuoteBlock({ value }: { value: QuoteBlockValue }) {
  return (
    <figure className="my-8 border-l-4 border-secondary pl-6">
      <blockquote className="text-2xl italic leading-[1.45] font-medium">{value?.quote}</blockquote>
      {value?.attribution ? (
        <figcaption className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          — {value.attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}

type ImageValue = { asset?: unknown; alt?: string; caption?: string }

function BodyImage({ value }: { value: ImageValue }) {
  if (!value?.asset) return null
  const url = urlFor(value as SanityImageSource).width(1440).fit('max').url()
  return (
    <figure className="my-8">
      <Image
        src={url}
        alt={value.alt || ''}
        width={1440}
        height={960}
        sizes="(min-width: 768px) 720px, 100vw"
        className="h-auto w-full rounded-xl"
      />
      {value.caption ? <figcaption className="mt-2 text-left text-xs text-muted-foreground">{value.caption}</figcaption> : null}
    </figure>
  )
}

type CodeBlockValue = { code?: { code?: string; language?: string } }

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 text-[32px] font-bold leading-[1.2] tracking-tight first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="mb-3 mt-10 text-2xl font-bold leading-[1.25] first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-3 mt-8 text-xl font-bold leading-[1.4] first:mt-0">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-secondary pl-6 text-2xl italic leading-[1.45]">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-6 list-disc space-y-2 pl-6 last:mb-0">{children}</ul>,
    number: ({ children }) => <ol className="mb-6 list-decimal space-y-2 pl-6 last:mb-0">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline underline-offset-2">{children}</span>,
    'strike-through': ({ children }) => <del>{children}</del>,
    code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>,
    link: LinkMark,
  },
  types: {
    image: BodyImage,
    callout: ({ value }) => <Callout value={value as CalloutValue} />,
    quoteBlock: ({ value }) => <QuoteBlock value={value as QuoteBlockValue} />,
    divider: () => <hr className="my-12 border-t" />,
    codeBlock: ({ value }) => {
      const code = (value as CodeBlockValue)?.code
      if (!code?.code) return null
      return <CodeBlock code={code.code} language={code.language} />
    },
  },
}

export type PortableTextRendererProps = {
  value?: ReadonlyArray<unknown> | null
  className?: string
}

/** Renders a full blog `post.body`, or nothing if empty/null. */
export function PortableTextRenderer({ value, className }: PortableTextRendererProps) {
  if (!value || value.length === 0) return null
  return (
    <div className={cn('max-w-none text-[18px] leading-[1.7] text-foreground/90', className)}>
      <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={components} />
    </div>
  )
}
