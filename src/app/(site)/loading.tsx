import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Route-level loading UI for the (site) group: skeletons roughly mirroring a
 * typical page (title band + content grid) to avoid layout shift while
 * server components stream in.
 */
export default function Loading() {
  return (
    <Container className="flex flex-col gap-8 py-16 md:py-24">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-3/4 max-w-[560px]" />
        <Skeleton className="h-5 w-full max-w-[480px]" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border p-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </Container>
  )
}
