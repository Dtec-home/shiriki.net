import { Banknote, EyeOff, MessagesSquare, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { SectionLabel } from '@/components/sections/section-label'

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
  eyebrow: 'Where the record lives today',
  heading: "Sunday's offering ends up in three places at once.",
  lead: "A cash count in one book, M-Pesa messages on the treasurer's phone, and the member register in a WhatsApp group. None of it reconciles until somebody retypes it.",
  items: [
    {
      title: 'The Monday count',
      text: 'Two people, a cash box, and a ledger book — then it gets typed into Excel and the two totals disagree.',
    },
    {
      title: 'PayBill on one handset',
      text: "Confirmation messages land on the treasurer's phone. Matching each one to a member is manual, and pledges go untracked.",
    },
    {
      title: 'Five WhatsApp groups',
      text: 'Announcements, attendance, and visitor follow-up live in chats nobody can search, filter, or export.',
    },
  ],
}

/** Icons for the three problem cards, in order — not sourced from Sanity. */
const ICONS: LucideIcon[] = [Banknote, EyeOff, MessagesSquare]

/**
 * Problem band: label + `<h2>` + lead, followed by three cards naming the
 * specific places a church's Sunday record currently splits. First section
 * below the hero.
 */
export function ProblemBand({ eyebrow, heading, lead, items }: ProblemBandProps) {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <SectionLabel className="text-primary">{eyebrow}</SectionLabel>
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
