import type { Metadata } from 'next'
import type { SanityImageSource } from '@sanity/image-url'
import { HandHeart, Lock, Smartphone, Sparkles, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CtaBand } from '@/components/sections/cta-band'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { buildMetadata } from '@/lib/metadata'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/fetch'
import { aboutPageQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'
import { SectionLabel } from '@/components/sections/section-label'

export const metadata: Metadata = buildMetadata({
  title: 'About us',
  description:
    'Shiriki is built by a team of East African engineers for churches across Africa — mobile-first, M-Pesa-native, and resilient without reliable internet.',
  path: '/about',
})

const VALUE_ICONS: Record<string, LucideIcon> = {
  stewardship: HandHeart,
  'hand-heart': HandHeart,
  simple: Sparkles,
  sparkles: Sparkles,
  trust: Lock,
  security: Lock,
  lock: Lock,
  africa: Smartphone,
  smartphone: Smartphone,
}

const VALUE_ICON_FALLBACK_ORDER: LucideIcon[] = [HandHeart, Sparkles, Lock, Smartphone]

const FALLBACK_HEADING = 'Software for African churches, built by people who serve in them.'
const FALLBACK_INTRO =
  'We believe every church — from a 40-member congregation in rural Turkana to a multi-campus church in Nairobi — deserves software built for how African ministries actually run: mobile-first, M-Pesa-native, and resilient without reliable internet.'

const FALLBACK_VALUES = [
  {
    title: 'Stewardship first',
    text: 'Every shilling given deserves a clear, auditable trail. We design for accountability before we design for anything else.',
    icon: 'hand-heart',
  },
  {
    title: 'Radically simple',
    text: 'A church office is run by volunteers, not IT departments. If a feature needs a manual, we redesign it.',
    icon: 'sparkles',
  },
  {
    title: 'Trust & security',
    text: 'Phone-and-OTP sign-in, per-church data isolation, and an audit log the board can read. A church\'s trust is not something to hand-wave.',
    icon: 'lock',
  },
  {
    title: 'Built for Africa',
    text: 'Mobile money first, feature phones supported, and every screen tested on a patchy 3G connection — not an afterthought.',
    icon: 'smartphone',
  },
]

/**
 * Both lists below are intentionally empty.
 *
 * They previously held six invented colleagues and six invented client
 * churches, rendered as fact on a public page. Their sections are guarded on
 * `length`, so each reappears the moment real entries exist — team members
 * from `aboutPage.team` in Sanity, partner churches here.
 */
const FALLBACK_TEAM: { name: string; role: string; avatar: SanityImageSource | null }[] = []

const CHURCH_PARTNERS: string[] = []

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type AboutPageDoc = {
  heading?: string | null
  intro?: string | null
  mission?: ReadonlyArray<unknown> | null
  values?: { title: string; description?: string | null; icon?: string | null }[] | null
  team?: { _id: string; name: string; role?: string | null; bio?: string | null; avatar?: SanityImageSource | null }[] | null
} | null

export default async function AboutPage() {
  const aboutPage = await sanityFetch<AboutPageDoc, AboutPageDoc>(
    aboutPageQuery,
    {},
    { next: { tags: [typeTag('aboutPage')] } },
    null,
  )

  const heading = aboutPage?.heading || FALLBACK_HEADING
  const intro = aboutPage?.intro || FALLBACK_INTRO
  const values =
    aboutPage?.values && aboutPage.values.length > 0
      ? aboutPage.values.map((v) => ({ title: v.title, text: v.description || '', icon: v.icon }))
      : FALLBACK_VALUES
  const team =
    aboutPage?.team && aboutPage.team.length > 0
      ? aboutPage.team.map((t) => ({ name: t.name, role: t.role || '', avatar: t.avatar ?? null }))
      : FALLBACK_TEAM

  return (
    <>
      <Container as="div" className="flex flex-col gap-20 py-16 md:py-24">
        <Reveal className="flex flex-col gap-5">
          <SectionLabel className="text-primary">About Shiriki</SectionLabel>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">{heading}</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p>
        </Reveal>

        <Reveal className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Our story</h2>
          </div>
          {aboutPage?.mission && aboutPage.mission.length > 0 ? (
            <SectionErrorBoundary label="AboutMission">
              <PortableTextRenderer value={aboutPage.mission} className="text-lg" />
            </SectionErrorBoundary>
          ) : (
            <div className="flex flex-col gap-4 text-lg leading-8 text-muted-foreground">
              <p>
                Shiriki started with a small team of software engineers who, between their day jobs,
                volunteered as treasurers and ushers in their local churches. Every Sunday night looked the same:
                cash counted by hand, M-Pesa statements reconciled line by line against a paper register, and giving
                records that lived in three different notebooks.
              </p>
              <p>
                What began as a single congregation&apos;s giving tracker grew into a full operations platform:
                giving, membership, communication, and events on one set of records. We are building it for
                churches across Kenya, Uganda, and Tanzania, around the principle we started with — every
                contribution should be visible, accountable, and easy to give.
              </p>
            </div>
          )}
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What we stand for</h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon =
                (value.icon && VALUE_ICONS[value.icon.toLowerCase()]) || VALUE_ICON_FALLBACK_ORDER[i % VALUE_ICON_FALLBACK_ORDER.length]
              return (
                <StaggerItem key={value.title}>
                  <article className="h-full rounded-2xl border bg-card p-6 shadow-brand-sm">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                      <Icon aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-lg font-bold">{value.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.text}</p>
                  </article>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>

        {team.length > 0 ? (
        <div className="flex flex-col gap-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">The team</h2>
          </Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
                  <Avatar size="lg">
                    {member.avatar ? (
                      <AvatarImage src={urlFor(member.avatar).width(104).height(104).fit('crop').url()} alt={member.name} />
                    ) : null}
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        ) : null}

        {CHURCH_PARTNERS.length > 0 ? (
        <div className="flex flex-col gap-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Churches running on Shiriki</h2>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap gap-3">
              {CHURCH_PARTNERS.map((church) => (
                <Badge key={church} variant="outline" className="h-auto px-4 py-2 text-sm">
                  {church}
                </Badge>
              ))}
            </div>
          </Reveal>
        </div>
        ) : null}
      </Container>

      <CtaBand
        heading="Want to see it running in a church like yours?"
        sub="We'll walk you through the platform with your own giving categories and roles set up."
        ctaLabel="Request a demo"
      />
    </>
  )
}
