import { CalendarDays, HeartHandshake, MessageSquare, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { SectionLabel } from '@/components/sections/section-label'

const ICONS: Record<'message' | 'calendar' | 'heart', LucideIcon> = {
  message: MessageSquare,
  calendar: CalendarDays,
  heart: HeartHandshake,
}

export type DigitalHomeItem = {
  icon: 'message' | 'calendar' | 'heart'
  title: string
  text: string
}

export type DigitalHomeProps = {
  eyebrow: string
  heading: string
  lead: string
  items: DigitalHomeItem[]
}

export const FALLBACK_DIGITAL_HOME: DigitalHomeProps = {
  eyebrow: 'Communication and events',
  heading: 'Announcements that reach the members without smartphones.',
  lead: 'SMS, push, and email sent to one group, one ministry, or everyone who gave last month — plus event RSVPs, M-Pesa ticketing, and a sermon archive.',
  items: [
    {
      icon: 'message',
      title: 'Communication',
      text: 'Targeted SMS, push, and email, segmented by group, ministry, or giving history.',
    },
    {
      icon: 'calendar',
      title: 'Events & attendance',
      text: 'RSVPs, venues, volunteer rosters, paid M-Pesa tickets, and post-event feedback.',
    },
    {
      icon: 'heart',
      title: 'Sermons & pledges',
      text: 'Publish sermons, devotionals, and prayer requests, and run pledge campaigns members can track.',
    },
  ],
}

/**
 * Dark `bg-foreground` band covering the reach side of the platform, with
 * three capability cards (communication, events, sermons and pledges).
 */
export function DigitalHome({ eyebrow, heading, lead, items }: DigitalHomeProps) {
  return (
    <section className="bg-foreground py-20 text-background lg:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionLabel className="text-secondary dark:text-background">{eyebrow}</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          <p className="mt-5 text-lg leading-8 text-background/60">{lead}</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <StaggerItem key={item.title}>
                <article className="h-full rounded-2xl border border-background/10 bg-background/5 p-7">
                  <Icon className="text-secondary dark:text-background" aria-hidden="true" />
                  <h3 className="mt-7 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-background/60">{item.text}</p>
                </article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </Container>
    </section>
  )
}
