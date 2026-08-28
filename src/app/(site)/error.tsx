'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

/**
 * Error boundary for the public site. Must be a Client Component (Next.js
 * requirement). Logs the error and offers a retry (reset) plus a way home.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[site:error]', error)
  }, [error])

  return (
    <Container className="flex min-h-[50vh] flex-col items-start justify-center gap-6 py-16 md:py-24">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Something went wrong</span>
      <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">We hit an unexpected error.</h1>
      <p className="max-w-[480px] text-lg leading-8 text-muted-foreground">
        Sorry about that. You can try again, or head back home. If it keeps happening, please get in touch.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" render={<Link href="/" />}>
          Back to home
        </Button>
      </div>
    </Container>
  )
}
