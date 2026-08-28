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
  title: 'Privacy policy',
  description: 'How Kanisa Connect collects, uses, stores, and protects church, giving, and member data.',
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
  const updated = legalPage?.lastUpdated
    ? new Date(legalPage.lastUpdated).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'August 2026'
  const hasCmsBody = Boolean(legalPage?.body && legalPage.body.length > 0)

  return (
    <Container size="prose" as="div" className="flex flex-col gap-8 py-16 md:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Legal</span>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Privacy policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </div>

      <div className="flex gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-secondary-foreground" aria-hidden="true" />
        <p className="text-sm leading-6 text-foreground">
          <strong>Placeholder pending legal review.</strong> This policy is a good-faith draft prepared for Kanisa
          Connect&apos;s launch and has not yet been reviewed by a qualified data protection lawyer in Kenya or the EU.
          Do not treat it as final legal advice; it will be updated before general availability.
        </p>
      </div>

      {hasCmsBody ? (
        <SectionErrorBoundary label="PrivacyBody">
          <PortableTextRenderer value={legalPage!.body} />
        </SectionErrorBoundary>
      ) : (
      <div className="flex flex-col gap-8 text-base leading-7 text-muted-foreground">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">1. Who this policy covers</h2>
          <p>
            This policy applies to Kanisa Connect (&ldquo;we&rdquo;, &ldquo;us&rdquo;), the church administrators and
            staff who use our platform (&ldquo;church accounts&rdquo;), and the individual church members whose
            records those accounts manage (&ldquo;members&rdquo;). Where a church is the data controller for its own
            members&apos; information, Kanisa Connect acts as a data processor on the church&apos;s behalf.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">2. What we collect</h2>
          <p>We collect and process the following categories of information:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Member records:</strong> name, phone number, email, date of birth, household/family
              relationships, group memberships, and attendance history entered by church administrators.
            </li>
            <li>
              <strong>Financial and giving data:</strong> M-Pesa, Airtel Money, card, and USSD transaction
              references, amounts, giving categories, pledges, and reconciliation status. We never store full M-Pesa
              PINs or card numbers — these are handled directly by Safaricom, Airtel, and our PCI-DSS compliant
              payment processor.
            </li>
            <li>
              <strong>Communication data:</strong> SMS, push notification, and email delivery logs sent through the
              platform on a church&apos;s behalf.
            </li>
            <li>
              <strong>Account and usage data:</strong> login timestamps, OTP verification events, device and browser
              information, and admin action logs (for audit purposes).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">3. Why we process this data</h2>
          <p>
            We process member and financial data to operate the church management services a church account has
            subscribed to: recording and reconciling giving, maintaining member directories, sending
            church-authorized communications, running events, and generating financial reports for the
            church&apos;s own governance and audit needs. We do not sell member or giving data to third parties.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">4. M-Pesa and mobile money transaction records</h2>
          <p>
            Giving transactions initiated via M-Pesa STK Push, PayBill, Airtel Money, USSD, or card are matched to a
            member record and giving category and retained as part of the church&apos;s financial ledger. These
            records are treated with the same sensitivity as banking records: access is restricted to admin roles
            explicitly granted financial permissions, and every view or export is written to an immutable audit log.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">5. Data retention</h2>
          <p>
            Financial and giving records are retained for at least seven years to support church financial audits
            and Kenyan tax record-keeping norms, unless a church requests earlier deletion where not otherwise
            required by law. Member profile data is retained for the life of the church account and deleted, or
            anonymized, within 90 days of a verified deletion request or account closure, subject to any records we
            are legally required to keep.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">6. Kenya&apos;s Data Protection Act, 2019</h2>
          <p>
            Kanisa Connect is designed to operate consistently with Kenya&apos;s Data Protection Act, 2019 and the
            regulations issued by the Office of the Data Protection Commissioner (ODPC). This includes: processing
            personal data lawfully, fairly, and transparently; collecting data for specified, explicit purposes;
            minimizing data collected to what is necessary; and implementing appropriate technical and
            organizational security measures. Kenyan data subjects have the right to be informed of processing,
            access their data, correct inaccurate data, object to processing, and request deletion, subject to
            statutory retention requirements described above.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">7. GDPR for diaspora members</h2>
          <p>
            Members giving or registering from the European Union, the United Kingdom, or other jurisdictions with
            equivalent data protection law are additionally afforded the rights available under the General Data
            Protection Regulation (GDPR), including the right to access, rectify, erase, restrict, or port their
            personal data, and the right to lodge a complaint with a supervisory authority. Where diaspora giving
            data is transferred outside the EU/UK, we rely on standard contractual clauses or equivalent safeguards
            with our processors.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">8. Security measures</h2>
          <p>
            Access to the platform is phone-OTP only — there are no reusable passwords. Data is encrypted in transit
            (TLS) and at rest. Admin sessions use short-lived, rotating tokens. Every financial and member-record
            action is written to an immutable audit log. Access to production systems is restricted to authorized
            engineering staff under least-privilege principles.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">9. Your rights and how to exercise them</h2>
          <p>
            To access, correct, or request deletion of your data, contact your church administrator directly (they
            control your member record), or email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will route your request to the relevant church account and respond within the timelines required
            by applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-foreground">10. Changes to this policy</h2>
          <p>
            We will update this page as our practices evolve and as this policy completes formal legal review. We
            encourage church administrators to review it periodically.
          </p>
        </section>
      </div>
      )}
    </Container>
  )
}
