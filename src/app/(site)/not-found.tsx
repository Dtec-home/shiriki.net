import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

/**
 * Custom 404 for the public site. Rendered inside the (site) layout, so it
 * keeps the header/footer.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-start justify-center gap-6 py-16 md:py-24">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">404 — Not found</span>
      <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">This page doesn&apos;t exist.</h1>
      <p className="max-w-[480px] text-lg leading-8 text-muted-foreground">
        The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/" />}>Back to home</Button>
        <Button variant="outline" render={<Link href="/contact" />}>
          Contact us
        </Button>
      </div>
    </Container>
  )
}
