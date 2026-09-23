import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { buildMetadata } from '@/lib/metadata'
import { PRIVACY_POLICY_LAST_UPDATED, privacyPolicyBody } from '@/lib/legal/privacy-policy'
import { sanityFetch } from '@/sanity/lib/fetch'
import { legalPageQuery } from '@/sanity/lib/queries'
import { slugTag, typeTag } from '@/sanity/lib/live'
import { SectionLabel } from '@/components/sections/section-label'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy policy',
  description:
    'What Shiriki collects from churches, members and givers, how it is used and shared, how long it is kept, and how to delete your account.',
  path: '/privacy',
})

type LegalPageDoc = {
  title?: string | null
  lastUpdated?: string | null
  body?: ReadonlyArray<unknown> | null
} | null

export default async function PrivacyPolicyPage() {
  const legalPage = await sanityFetch<LegalPageDoc, LegalPageDoc>(
    legalPageQuery,
    { slug: 'privacy' },
    { next: { tags: [typeTag('legalPage'), slugTag('legalPage', 'privacy')] } },
    null,
  )
  // The CMS copy wins when it has a body; otherwise render the same policy
  // from source, so the page is complete even with Sanity unreachable.
  const hasCmsBody = Boolean(legalPage?.body && legalPage.body.length > 0)
  const body = hasCmsBody ? legalPage!.body : privacyPolicyBody
  const updated = new Date(
    (hasCmsBody && legalPage?.lastUpdated) || PRIVACY_POLICY_LAST_UPDATED,
  ).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Nairobi' })

  return (
    <Container size="prose" as="div" className="flex flex-col gap-8 py-16 md:py-24">
      <div className="flex flex-col gap-3">
        <SectionLabel className="text-primary">Legal</SectionLabel>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Privacy policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </div>

      <SectionErrorBoundary label="PrivacyBody">
        <PortableTextRenderer value={body} />
      </SectionErrorBoundary>
    </Container>
  )
}
