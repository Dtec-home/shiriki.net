import { CalendarDays, HeartHandshake, MessageSquare, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'

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
  eyebrow: 'One digital home',
  heading: 'Reach every member, every way.',
  lead: 'Manage events, sermons, campaigns, and conversations from one calm, capable hub.',
  items: [
    {
      icon: 'message',
      title: 'Communication hub',
      text: 'Targeted SMS, push notifications, email campaigns, and ministry updates in one place.',
    },
    {
      icon: 'calendar',
      title: 'Events & engagement',
      text: 'RSVPs, venues, volunteers, paid M-Pesa tickets, and feedback without the spreadsheets.',
    },
    {
      icon: 'heart',
      title: 'Digital content',
      text: 'Share sermons, devotionals, prayer requests, pledges, and campaigns with your church family.',
    },
  ],
}

/**
 * Dark `bg-foreground` band: "Reach every member, every way." with three
 * capability cards (communication, events, digital content).
 */
export function DigitalHome({ eyebrow, heading, lead, items }: DigitalHomeProps) {
  return (
    <section className="bg-foreground py-20 text-background lg:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary dark:text-background">{eyebrow}</p>
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
