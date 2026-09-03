import { BarChart3, Check, HeartHandshake, ShieldCheck, Smartphone, Users, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { SectionLabel } from '@/components/sections/section-label'

/**
 * Icon lookup for feature cards. Keyed loosely (lowercased, common aliases)
 * so a free-text `icon` string from the Sanity `feature` document (e.g.
 * "users", "bar-chart-3", "chart") resolves sensibly; unrecognized values
 * fall back to `Users`.
 */
const ICONS: Record<string, LucideIcon> = {
  users: Users,
  chart: BarChart3,
  'bar-chart-3': BarChart3,
  'bar-chart': BarChart3,
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  heart: HeartHandshake,
  'heart-handshake': HeartHandshake,
  smartphone: Smartphone,
  phone: Smartphone,
}

export type FeatureCardData = {
  /** Free-text icon key (e.g. "users", "chart"). Unrecognized values fall back to a default icon. */
  icon: string
  title: string
  text: string
  items: string[]
  /** Renders the card on the dark `bg-primary` surface instead of the light muted surface. */
  dark?: boolean
}

export type FeaturesGridProps = {
  eyebrow: string
  heading: string
  lead: string
  cards: FeatureCardData[]
}

export const FALLBACK_FEATURES_GRID: FeaturesGridProps = {
  eyebrow: 'Members and money',
  heading: 'The welcome desk and the finance office, on the same records.',
  lead: 'A visitor who signs in on Sunday becomes a member record, a giving history, and a follow-up task — without anyone retyping a name.',
  cards: [
    {
      icon: 'users',
      title: 'Know your congregation',
      text: 'Members sign in with a phone number and an OTP. Profiles carry families, groups, and attendance, and the visitor pipeline tracks who came back a second time.',
      items: ['Bulk CSV import up to 5k', '7+ granular admin roles', 'Visitor conversion pipeline'],
    },
    {
      icon: 'chart',
      title: 'Books your treasurer can close',
      text: 'Every gift posts to a general ledger with an audit trail. Reconciliation runs against the member register on its own, so the treasurer reviews exceptions rather than every line.',
      items: ['General ledger & budgets', 'Expense claims with approvals', 'Excel & PDF reports'],
      dark: true,
    },
  ],
}

/**
 * Feature pair: a light "know your congregation" card and a dark treasurer's
 * card. Anchored as `#features` for the main nav's "Features" link. Card
 * titles are `<h3>` (the original monolith wrongly used `<h2>` here).
 */
export function FeaturesGrid({ eyebrow, heading, lead, cards }: FeaturesGridProps) {
  return (
    <section id="features" className="scroll-mt-20 py-20 lg:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal className="max-w-2xl">
          <SectionLabel className="text-primary">{eyebrow}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{lead}</p>
        </Reveal>
        <Stagger className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <StaggerItem key={card.title}>
              <FeatureCard {...card} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}

function FeatureCard({ icon, title, text, items, dark = false }: FeatureCardData) {
  const Icon = ICONS[icon?.toLowerCase() ?? ''] ?? Users
  return (
    <article
      className={
        dark
          ? 'h-full rounded-3xl bg-primary p-8 text-primary-foreground shadow-brand-xl lg:p-10'
          : 'h-full rounded-3xl border bg-muted/40 p-8 lg:p-10'
      }
    >
      <Icon className={dark ? 'text-secondary dark:text-primary-foreground' : 'text-primary'} aria-hidden="true" />
      <h3 className="mt-7 text-2xl font-bold">{title}</h3>
      <p className={`mt-4 leading-7 ${dark ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{text}</p>
      <ul className="mt-7 flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-2 text-sm ${dark ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}
          >
            <Check className={dark ? 'text-secondary dark:text-primary-foreground' : 'text-primary'} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
