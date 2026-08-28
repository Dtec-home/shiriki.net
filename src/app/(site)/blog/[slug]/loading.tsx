import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Route-level loading UI for a single `/blog/[slug]` post, mirroring the
 * article's structure (centered title + byline, wide cover image, prose
 * body) so there's no layout shift once the real post streams in.
 */
export default function BlogPostLoading() {
  return (
    <div className="flex flex-col">
      <Container size="prose" as="div" className="flex flex-col items-center gap-6 py-16 text-center md:pt-24">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-10 w-full max-w-2xl md:h-12" />
          <Skeleton className="h-10 w-2/3 max-w-md md:h-12" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col items-start gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </div>
      </Container>

      <Container size="wide" as="div" className="mb-12">
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      </Container>

      <Container size="prose" as="div" className="flex flex-col gap-4 pb-12">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </Container>
    </div>
  )
}
