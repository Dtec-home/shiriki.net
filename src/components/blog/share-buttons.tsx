'use client'

import { useState } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export type ShareButtonsProps = {
  /** Absolute or root-relative URL of the post. Resolved against the current origin. */
  url: string
  title: string
}

/**
 * Blog share controls. Uses the Web Share API where available and falls back
 * to copy-to-clipboard everywhere. Client Component: reads `navigator` and
 * holds copied state.
 */
export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  function resolveUrl(): string {
    if (/^https?:\/\//.test(url)) return url
    if (typeof window !== 'undefined') return new URL(url, window.location.origin).toString()
    return url
  }

  async function handleCopy() {
    const fullUrl = resolveUrl()
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy the link")
    }
  }

  async function handleShare() {
    const fullUrl = resolveUrl()
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url: fullUrl })
      } catch {
        // User dismissed the share sheet — no-op.
      }
      return
    }
    await handleCopy()
  }

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Share</span>
      {canNativeShare ? (
        <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={handleShare}>
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </Button>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={handleCopy}>
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  )
}
