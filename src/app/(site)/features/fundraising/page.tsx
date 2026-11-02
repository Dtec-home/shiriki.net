import type { Metadata } from 'next'
import Link from 'next/link'
import { defineQuery } from 'next-sanity'
import {
  ArrowRight,
  Check,
  FileText,
  Fingerprint,
  Globe,
  Handshake,
  Layers,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { CtaBand } from '@/components/sections/cta-band'
import { SectionLabel } from '@/components/sections/section-label'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { BreadcrumbLd, JsonLd } from '@/components/seo/json-ld'
import { faqPageSchema } from '@/lib/json-ld'
import { buildMetadata } from '@/lib/metadata'
import { sanityFetch } from '@/sanity/lib/fetch'
import { typeTag } from '@/sanity/lib/live'
import {
  FUNDRAISING_BULLETS,
  FUNDRAISING_CAPABILITIES,
  FUNDRAISING_CHANNELS,
  FUNDRAISING_DEVICE_SIGN_IN,
  FUNDRAISING_FAQ,
  FUNDRAISING_FEATURE_ID,
  FUNDRAISING_HEADING,
  FUNDRAISING_PATH,
  FUNDRAISING_PLAN_ROWS,
  FUNDRAISING_SMS_NOTE,
  FUNDRAISING_SUMMARY,
  FUNDRAISING_TITLE,
  FUNDRAISING_WHATSAPP,
} from './content'

export const metadata: Metadata = buildMetadata({
  title: 'Church Fundraising, Pledges & Harambee Campaigns',
  description:
    'Run church fundraising campaigns on your own Pay Bill: campaign codes, pledges that clear themselves, champions, a public progress page and an automatic WhatsApp leaderboard.',
  path: FUNDRAISING_PATH,
  image: `${FUNDRAISING_PATH}/opengraph-image`,
})

// Kept beside the page (not in sanity/lib/queries.ts) because only this route
// reads a single feature by id.
const fundraisingFeatureQuery = defineQuery(`
  *[_type == "feature" && _id == $id][0]{
    title,
    description,
    bullets,
  }
`)

type FundraisingFeatureDoc = {
  title?: string | null
  description?: string | null
  bullets?: string[] | null
} | null

const ICONS: Record<string, LucideIcon> = {
  handshake: Handshake,
  megaphone: Megaphone,
  globe: Globe,
  'file-text': FileText,
  layers: Layers,
  'shield-check': ShieldCheck,
}

export default async function FundraisingFeaturePage() {
  const feature = await sanityFetch<FundraisingFeatureDoc, FundraisingFeatureDoc>(
    fundraisingFeatureQuery,
    { id: FUNDRAISING_FEATURE_ID },
    { next: { tags: [typeTag('feature')] } },
    null,
  )

  const eyebrow = feature?.title || FUNDRAISING_TITLE
  const intro = feature?.description || FUNDRAISING_SUMMARY
  const bullets = feature?.bullets && feature.bullets.length > 0 ? feature.bullets : FUNDRAISING_BULLETS

  return (
    <>
      <BreadcrumbLd name={FUNDRAISING_TITLE} path={FUNDRAISING_PATH} />
      <JsonLd data={faqPageSchema(FUNDRAISING_FAQ)} />

      <Container as="div" className="flex flex-col gap-20 py-16 md:py-24">
        {/* Hero */}
        <Reveal className="flex flex-col gap-5">
          <SectionLabel className="text-primary">{eyebrow}</SectionLabel>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {FUNDRAISING_HEADING}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p>
          <ul className="mt-2 grid max-w-3xl gap-3 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DemoRequestDialog>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground shadow-brand-lg transition-colors hover:bg-primary/90"
              >
                Request a demo
              </button>
            </DemoRequestDialog>
            <Link
              href="/pricing"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border bg-card px-6 py-2 font-semibold text-card-foreground shadow-brand-sm transition-colors hover:bg-muted"
            >
              See plans and pricing
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Reveal>

        {/* How givers reach a campaign */}
        <section aria-labelledby="fundraising-channels" className="flex flex-col gap-8">
          <Reveal className="max-w-2xl">
            <SectionLabel className="text-primary">Every way to give counts</SectionLabel>
            <h2 id="fundraising-channels" className="mt-4 text-balance text-2xl font-bold tracking-tight md:text-4xl">
              Givers use the channels they already know.
            </h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-2">
            {FUNDRAISING_CHANNELS.map((channel) => (
              <StaggerItem key={channel.title}>
                <article className="h-full rounded-2xl border bg-card p-6 shadow-brand-sm">
                  <h3 className="text-lg font-bold">{channel.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{channel.text}</p>
                  {channel.example ? (
                    <p className="mt-4 inline-flex rounded-md bg-muted px-2.5 py-1 font-mono text-sm text-foreground">
                      <span className="sr-only">Example account numbers: </span>
                      {channel.example}
                    </p>
                  ) : null}
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Capabilities */}
        <section aria-labelledby="fundraising-capabilities" className="flex flex-col gap-8">
          <Reveal className="max-w-2xl">
            <SectionLabel className="text-primary">What the treasurer gets</SectionLabel>
            <h2
              id="fundraising-capabilities"
              className="mt-4 text-balance text-2xl font-bold tracking-tight md:text-4xl"
            >
              From the first pledge to the close-out statement.
            </h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FUNDRAISING_CAPABILITIES.map((capability) => {
              const Icon = ICONS[capability.icon] ?? Check
              return (
                <StaggerItem key={capability.title}>
                  <article className="h-full rounded-2xl border bg-card p-6 shadow-brand-sm">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                      <Icon aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-lg font-bold">{capability.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.text}</p>
                  </article>
                </StaggerItem>
              )
            })}
          </Stagger>
        </section>

        {/* WhatsApp leaderboard + device sign-in */}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Reveal>
            <section
              aria-labelledby="fundraising-whatsapp"
              className="h-full rounded-3xl bg-primary p-8 text-primary-foreground shadow-brand-xl lg:p-10"
            >
              <MessageCircle className="text-secondary dark:text-primary-foreground" aria-hidden="true" />
              <h2 id="fundraising-whatsapp" className="mt-6 text-2xl font-bold md:text-3xl">
                {FUNDRAISING_WHATSAPP.title}
              </h2>
              <p className="mt-4 leading-7 text-primary-foreground">{FUNDRAISING_WHATSAPP.text}</p>
              <ul className="mt-6 flex flex-col gap-3">
                {FUNDRAISING_WHATSAPP.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-primary-foreground">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-secondary dark:text-primary-foreground"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-semibold">Included in Kanisa and above.</p>
            </section>
          </Reveal>
          <Reveal>
            <section aria-labelledby="fundraising-device" className="h-full rounded-3xl border bg-muted/40 p-8 lg:p-10">
              <Fingerprint className="text-primary" aria-hidden="true" />
              <h2 id="fundraising-device" className="mt-6 text-2xl font-bold md:text-3xl">
                {FUNDRAISING_DEVICE_SIGN_IN.title}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">{FUNDRAISING_DEVICE_SIGN_IN.text}</p>
              <p className="mt-6 text-sm font-semibold">Included in every plan.</p>
            </section>
          </Reveal>
        </div>

        {/* Plans */}
        <section aria-labelledby="fundraising-plans-heading" className="flex flex-col gap-6">
          <Reveal className="max-w-2xl">
            <SectionLabel className="text-primary">Plans</SectionLabel>
            <h2
              id="fundraising-plans-heading"
              className="mt-4 text-balance text-2xl font-bold tracking-tight md:text-4xl"
            >
              Which plan includes what.
            </h2>
          </Reveal>
          <Reveal>
            <div className="overflow-x-auto rounded-2xl border bg-card shadow-brand-sm">
              <table data-testid="fundraising-plans" className="w-full text-left text-sm">
                <caption className="sr-only">Fundraising capabilities and the plans that include them</caption>
                <thead className="bg-muted/60">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Capability
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FUNDRAISING_PLAN_ROWS.map((row) => (
                    <tr key={row.key} data-plan={row.key} className="border-t">
                      <th scope="row" className="px-5 py-3 font-medium">
                        {row.capability}
                      </th>
                      <td className="px-5 py-3 text-muted-foreground">{row.plan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{FUNDRAISING_SMS_NOTE}</p>
        </section>

        {/* FAQ */}
        <section aria-labelledby="fundraising-faq" className="flex flex-col gap-6">
          <Reveal>
            <h2 id="fundraising-faq" className="text-2xl font-bold tracking-tight md:text-3xl">
              Fundraising questions
            </h2>
          </Reveal>
          <dl className="grid max-w-4xl gap-6 md:grid-cols-2">
            {FUNDRAISING_FAQ.map((item) => (
              <div key={item.question} className="rounded-2xl border bg-card p-6">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Container>

      <CtaBand
        heading="Planning a drive this year?"
        sub="Tell us what you are raising for and we will show you how it would run on Shiriki."
        ctaLabel="Request a demo"
      />
    </>
  )
}
