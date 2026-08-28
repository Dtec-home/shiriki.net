import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { buildMetadata } from '@/lib/metadata'
import { CONTACT_EMAIL } from '@/lib/site'
import { sanityFetch } from '@/sanity/lib/fetch'
import { legalPageQuery } from '@/sanity/lib/queries'
import { slugTag, typeTag } from '@/sanity/lib/live'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of service',
  description: 'The terms governing a church account\'s use of the Shiriki platform.',
  path: '/terms',
})

type LegalPageDoc = {
  title?: string | null
  lastUpdated?: string | null
  body?: ReadonlyArray<unknown> | null
} | null

export default async function TermsOfServicePage() {
  const legalPage = await sanityFetch<LegalPageDoc, LegalPageDoc>(
    legalPageQuery,
    { slug: 'terms' },
    { next: { tags: [typeTag('legalPage'), slugTag('legalPage', 'terms')] } },
    null,
  )
  const updated = legalPage?.lastUpdated
    ? new Date(legalPage.lastUpdated).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'August 2026'
  const hasCmsBody = Boolean(legalPage?.body && legalPage.body.length > 0)

  return (
    <Container size="prose" as="div" className="flex flex-col gap-8 py-16 md:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Legal</span>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Terms of service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </div>

      <div className="flex gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-secondary-foreground" aria-hidden="true" />
        <p className="text-sm leading-6 text-foreground">
          <strong>Placeholder pending legal review.</strong> These terms are a good-faith draft prepared for Shiriki
          Connect&apos;s launch and have not yet been reviewed by qualified counsel. Do not treat them as final; they
          will be updated before general availability.
        </p>
      </div>

      {hasCmsBody ? (
        <SectionErrorBoundary label="TermsBody">
          <PortableTextRenderer value={legalPage!.body} />
        </SectionErrorBoundary>
      ) : (
      <div className="flex flex-col gap-8 text-base leading-7 text-muted-foreground">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of these terms</h2>
          <p>
            By creating a church account or otherwise using Shiriki, you agree to these terms on behalf of the
            church or organization you represent. If you do not have authority to bind that organization, do not use
            the platform.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">2. The service</h2>
          <p>
            Shiriki provides church management software covering giving (M-Pesa, Airtel Money, card, and
            USSD), member records, communication, events, and financial reporting. We may add, change, or remove
            features over time; material reductions in a paid plan&apos;s functionality will be communicated in
            advance.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">3. Church accounts and responsibilities</h2>
          <p>
            The church account holder is responsible for the accuracy of the member and financial data entered into
            the platform, for granting admin roles appropriately, and for obtaining any consents required from its
            members to process their personal data through Shiriki. Church admins must keep their login
            credentials (OTP-verified phone numbers) secure and promptly report any suspected unauthorized access.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">4. Fees and billing</h2>
          <p>
            The Starter plan is free. Paid plans (Growth and Enterprise) are billed monthly in Kenyan Shillings via
            M-Pesa or card, in advance, and are non-refundable except where required by law. Prices may change with
            at least 30 days&apos; notice to the church account&apos;s registered contact.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">5. Giving and payment processing</h2>
          <p>
            M-Pesa, Airtel Money, card, and USSD payments are processed by Safaricom, Airtel, and our licensed
            payment processing partners, not by Shiriki directly. We are not a bank or a holder of client
            funds; contributions are settled to the church&apos;s own PayBill/Till or bank account per the payment
            provider&apos;s standard settlement schedule. Unmatched or disputed transactions are held for admin
            resolution within the platform.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">6. Data ownership</h2>
          <p>
            A church account owns the member and financial data it enters into Shiriki. We process that data
            as described in our{' '}
            <a href="/privacy" className="text-primary underline underline-offset-2">
              Privacy Policy
            </a>{' '}
            and will export a full copy of a church&apos;s data on request within 30 days of a written request to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">7. Acceptable use</h2>
          <p>
            The platform may not be used to send unsolicited or unlawful communications, to process payments
            unrelated to legitimate church activity, to attempt to access another church account&apos;s data, or in
            any way that violates applicable Kenyan or international law.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">8. Availability and support</h2>
          <p>
            We target high availability for the platform but do not guarantee uninterrupted service. Support
            response times vary by plan, as described on our{' '}
            <a href="/pricing" className="text-primary underline underline-offset-2">
              pricing page
            </a>
            . Enterprise accounts may be covered by a separate service-level agreement.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">9. Termination</h2>
          <p>
            A church account may cancel at any time; access continues until the end of the current billing period.
            We may suspend or terminate an account for material breach of these terms, non-payment, or unlawful use,
            with notice where reasonably practicable.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Shiriki&apos;s liability arising from use of the platform
            is limited to the fees paid by the church account in the twelve months preceding the claim. We are not
            liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">11. Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of Kenya, without regard to conflict-of-law
            principles, subject to any mandatory consumer or data protection rights available to diaspora members
            under their own local law.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">12. Changes to these terms</h2>
          <p>
            We will update this page as the service evolves and as these terms complete formal legal review. Continued
            use of the platform after changes take effect constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
      )}
    </Container>
  )
}
