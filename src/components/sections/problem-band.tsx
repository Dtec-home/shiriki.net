import { Banknote, EyeOff, MessagesSquare, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'

export type ProblemItem = {
  title: string
  text: string
}

export type ProblemBandProps = {
  eyebrow: string
  heading: string
  lead: string
  items: ProblemItem[]
}

export const FALLBACK_PROBLEM_BAND: ProblemBandProps = {
  eyebrow: 'The old way stops here',
  heading: 'Churches deserve better tools.',
  lead: 'Move past manual cash counting, paper records, and scattered WhatsApp groups.',
  items: [
    { title: 'Manual processes', text: 'No more error-prone cash counting or lost paper records.' },
    { title: 'Zero visibility', text: 'See who gave what, when, and how much in real time.' },
    { title: 'Fragmented comms', text: 'Centralize your messages away from chaotic group chats.' },
  ],
}

/** Icons for the three problem cards, in order — not sourced from Sanity. */
const ICONS: LucideIcon[] = [Banknote, EyeOff, MessagesSquare]

/**
 * "The old way stops here" band: eyebrow + `<h2>` + lead, followed by three
 * problem cards on a muted surface. First section below the hero.
 */
export function ProblemBand({ eyebrow, heading, lead, items }: ProblemBandProps) {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{lead}</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <StaggerItem key={item.title}>
                <article className="h-full rounded-2xl border bg-card p-7 shadow-brand-sm">
                  <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </Container>
    </section>
  )
}
