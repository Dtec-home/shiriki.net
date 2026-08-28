import type { Metadata } from 'next'
import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { PostCard, type PostCardPost } from '@/components/blog/post-card'
import { Button } from '@/components/ui/button'
import { buildMetadata } from '@/lib/metadata'
import { sanityFetch } from '@/sanity/lib/fetch'
import { postsQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Practical writing on church giving, membership, and ministry operations across East Africa.',
  path: '/blog',
})

type PostListItem = PostCardPost & { _id: string }

export default async function BlogIndexPage() {
  const posts = await sanityFetch<PostListItem[], PostListItem[]>(
    postsQuery,
    {},
    { next: { tags: [typeTag('post')] } },
    [],
  )

  return (
    <Container as="div" className="flex flex-col gap-12 py-16 md:py-24">
      <Reveal className="flex flex-col gap-4">
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">The Shiriki blog</span>
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Ideas for running a connected church.
        </h1>
        <p className="max-w-[640px] text-lg leading-8 text-muted-foreground">
          Practical writing on giving, membership, and ministry operations, from a team building for churches across
          East Africa.
        </p>
      </Reveal>

      {posts.length > 0 ? (
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post._id}>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <Newspaper className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold">No articles yet</h2>
          <p className="max-w-sm text-muted-foreground">
            We&apos;re preparing our first posts on church giving and ministry operations. Check back soon, or reach
            out with a topic you&apos;d like us to cover.
          </p>
          <Button render={<Link href="/contact" />} className="mt-2">
            Suggest a topic
          </Button>
        </Reveal>
      )}
    </Container>
  )
}
