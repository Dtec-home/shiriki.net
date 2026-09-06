import type { Metadata } from 'next'
import { Hero, FALLBACK_HERO } from '@/components/sections/hero'
import { ChannelStrip } from '@/components/sections/channel-strip'
import { ProblemBand, FALLBACK_PROBLEM_BAND } from '@/components/sections/problem-band'
import { GivingChannels, FALLBACK_GIVING_CHANNELS } from '@/components/sections/giving-channels'
import { FeaturesGrid, FALLBACK_FEATURES_GRID } from '@/components/sections/features-grid'
import { DigitalHome, FALLBACK_DIGITAL_HOME } from '@/components/sections/digital-home'
import { SecurityBand, FALLBACK_SECURITY_BAND } from '@/components/sections/security-band'
import { Testimonials, FALLBACK_TESTIMONIALS } from '@/components/sections/testimonials'
import { CtaBand } from '@/components/sections/cta-band'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { JsonLd } from '@/components/seo/json-ld'
import { MAIN_NAV } from '@/lib/nav'
import { buildMetadata } from '@/lib/metadata'
import { softwareApplicationSchema } from '@/lib/json-ld'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, USSD_CODE } from '@/lib/site'
import { sanityFetch } from '@/sanity/lib/fetch'
import { featuresQuery, givingChannelsQuery, homePageQuery, testimonialsQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'

type CtaLinkDoc = { label?: string | null; href?: string | null; variant?: string | null } | null

type HomePageDoc = {
  heroEyebrow?: string | null
  heroHeadline?: string | null
  heroHeadlineHighlight?: string | null
  heroSubheadline?: string | null
  heroPrimaryCta?: CtaLinkDoc
  heroSecondaryCta?: CtaLinkDoc
  heroBadgeText?: string | null
  problemBandEyebrow?: string | null
  problemBandHeading?: string | null
  problemBandIntro?: string | null
  problems?: { title: string; text?: string | null }[] | null
  givingSectionHeading?: string | null
  givingSectionIntro?: string | null
  featuresSectionHeading?: string | null
  featuresSectionIntro?: string | null
  digitalHomeHeading?: string | null
  digitalHomeIntro?: string | null
  securityHeading?: string | null
  securityIntro?: string | null
  securityBadges?: { icon?: string | null; label: string }[] | null
  ussdPanel?: { eyebrow?: string | null; code?: string | null; body?: string | null; cta?: CtaLinkDoc } | null
} | null

type GivingChannelDoc = {
  _id: string
  name: string
  description: string
  badge?: string | null
}

type FeatureDoc = {
  _id: string
  title: string
  description: string
  icon?: string | null
  bullets?: string[] | null
  emphasis?: boolean | null
}

type TestimonialDoc = {
  _id: string
  quote: string
  authorName: string
  authorRole?: string | null
  churchName: string
}

export const metadata: Metadata = buildMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
})

export default async function HomePage() {
  const [homePage, giving, features, testimonials] = await Promise.all([
    sanityFetch<HomePageDoc, HomePageDoc>(homePageQuery, {}, { next: { tags: [typeTag('homePage')] } }, null),
    sanityFetch<GivingChannelDoc[], GivingChannelDoc[]>(
      givingChannelsQuery,
      {},
      { next: { tags: [typeTag('givingChannel')] } },
      [],
    ),
    sanityFetch<FeatureDoc[], FeatureDoc[]>(featuresQuery, {}, { next: { tags: [typeTag('feature')] } }, []),
    sanityFetch<TestimonialDoc[], TestimonialDoc[]>(
      testimonialsQuery,
      {},
      { next: { tags: [typeTag('testimonial')] } },
      [],
    ),
  ])

  // --- Hero ---
  // The headline is two Sanity fields, not one: `heroHeadline` in the text
  // colour and `heroHeadlineHighlight` in the brand teal after it. Splitting a
  // single string here would mean guessing which words an editor meant to
  // colour, and the guess would be wrong the first time anyone rewrote it.
  //
  // Sanity models the hero as two interchangeable CTAs, which no longer lines
  // up with the hero's three slots — and the seeded `heroPrimaryCta` points at
  // `/demo`, a route this site has never had. So the explore link is taken
  // from whichever CTA actually names a page the site navigates to, and the
  // demo dialog's label is never CMS-driven: a trigger labelled "See pricing"
  // that opens a demo form is worse than a stale label.
  const siteHrefs = new Set(MAIN_NAV.map((link) => link.href))
  const exploreCta = [homePage?.heroPrimaryCta, homePage?.heroSecondaryCta].find(
    (cta) => cta?.href && (siteHrefs.has(cta.href) || cta.href.startsWith('#')),
  )

  const hero = homePage?.heroHeadline
    ? {
        eyebrow: homePage.heroBadgeText || homePage.heroEyebrow || undefined,
        headingPrefix: homePage.heroHeadline,
        headingHighlight: homePage.heroHeadlineHighlight || '',
        lead: homePage.heroSubheadline || FALLBACK_HERO.lead,
        exploreHref: exploreCta?.href || FALLBACK_HERO.exploreHref,
        exploreLabel: exploreCta?.label || FALLBACK_HERO.exploreLabel,
      }
    : FALLBACK_HERO

  // --- Problem band ---
  const problemBand = {
    eyebrow: homePage?.problemBandEyebrow || FALLBACK_PROBLEM_BAND.eyebrow,
    heading: homePage?.problemBandHeading || FALLBACK_PROBLEM_BAND.heading,
    lead: homePage?.problemBandIntro || FALLBACK_PROBLEM_BAND.lead,
    items:
      homePage?.problems && homePage.problems.length > 0
        ? homePage.problems.map((p) => ({ title: p.title, text: p.text || '' }))
        : FALLBACK_PROBLEM_BAND.items,
  }

  // --- Giving channels ---
  const givingChannels = {
    ...FALLBACK_GIVING_CHANNELS,
    heading: homePage?.givingSectionHeading || FALLBACK_GIVING_CHANNELS.heading,
    lead: homePage?.givingSectionIntro || FALLBACK_GIVING_CHANNELS.lead,
    channels:
      giving.length > 0
        ? giving.map((c) => `${c.name}${c.badge ? ` (${c.badge})` : ''} — ${c.description}`)
        : FALLBACK_GIVING_CHANNELS.channels,
  }

  // --- Features grid ---
  // The `feature` documents carry `bullets` + `emphasis`, matching this
  // section's two-card bullet/dark-highlight layout more closely than
  // DigitalHome's plain icon grid, so they're mapped here.
  const featuresGrid = {
    eyebrow: FALLBACK_FEATURES_GRID.eyebrow,
    heading: homePage?.featuresSectionHeading || FALLBACK_FEATURES_GRID.heading,
    lead: homePage?.featuresSectionIntro || FALLBACK_FEATURES_GRID.lead,
    cards:
      features.length > 0
        ? features.slice(0, 2).map((f) => ({
            icon: f.icon || 'users',
            title: f.title,
            text: f.description,
            items: f.bullets ?? [],
            dark: Boolean(f.emphasis),
          }))
        : FALLBACK_FEATURES_GRID.cards,
  }

  // --- Digital home ---
  // No dedicated Sanity list backs these three cards, so they stay static;
  // only the section header pulls from the CMS.
  const digitalHome = {
    ...FALLBACK_DIGITAL_HOME,
    heading: homePage?.digitalHomeHeading || FALLBACK_DIGITAL_HOME.heading,
    lead: homePage?.digitalHomeIntro || FALLBACK_DIGITAL_HOME.lead,
  }

  // --- Security band ---
  const securityBand = {
    eyebrow: FALLBACK_SECURITY_BAND.eyebrow,
    heading: homePage?.securityHeading || FALLBACK_SECURITY_BAND.heading,
    lead: homePage?.securityIntro || FALLBACK_SECURITY_BAND.lead,
    badges:
      homePage?.securityBadges && homePage.securityBadges.length > 0
        ? homePage.securityBadges.map((b) => ({ icon: b.icon || 'shield', label: b.label }))
        : FALLBACK_SECURITY_BAND.badges,
    ussd: homePage?.ussdPanel
      ? {
          eyebrow: homePage.ussdPanel.eyebrow || FALLBACK_SECURITY_BAND.ussd.eyebrow,
          code: homePage.ussdPanel.code || USSD_CODE,
          text: homePage.ussdPanel.body || FALLBACK_SECURITY_BAND.ussd.text,
          ctaLabel: homePage.ussdPanel.cta?.label || FALLBACK_SECURITY_BAND.ussd.ctaLabel,
        }
      : FALLBACK_SECURITY_BAND.ussd,
  }

  // --- Testimonials ---
  const testimonialItems =
    testimonials.length > 0
      ? testimonials.map((t) => ({
          _id: t._id,
          quote: t.quote,
          author: t.authorName,
          role: t.authorRole || '',
          church: t.churchName,
        }))
      : FALLBACK_TESTIMONIALS.items

  return (
    <>
      <JsonLd data={softwareApplicationSchema()} />
      <SectionErrorBoundary label="Hero">
        <Hero {...hero} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="ChannelStrip">
        <ChannelStrip />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="ProblemBand">
        <ProblemBand {...problemBand} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="GivingChannels">
        <GivingChannels {...givingChannels} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="FeaturesGrid">
        <FeaturesGrid {...featuresGrid} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="DigitalHome">
        <DigitalHome {...digitalHome} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="SecurityBand">
        <SecurityBand {...securityBand} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="Testimonials" silent>
        <Testimonials {...FALLBACK_TESTIMONIALS} items={testimonialItems} />
      </SectionErrorBoundary>
      <SectionErrorBoundary label="CtaBand">
        <CtaBand
          heading="Ready to connect your church?"
          sub="Tell us about your congregation and we'll tailor a walkthrough for your team."
          ctaLabel="Request a demo"
        />
      </SectionErrorBoundary>
    </>
  )
}
