import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Route-level loading UI for `/blog`, mirroring the index page's structure
 * (eyebrow + heading + lead, then a 1/2/3-column card grid) so the layout
 * doesn't shift once real posts stream in.
 */
export default function BlogIndexLoading() {
  return (
    <Container as="div" className="flex flex-col gap-12 py-16 md:py-24">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full max-w-2xl md:h-16" />
        <Skeleton className="h-5 w-full max-w-[640px]" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-brand-sm">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="flex flex-col gap-3 p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="mt-2 flex items-center gap-3 pt-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
