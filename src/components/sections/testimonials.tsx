import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Card, CardContent } from '@/components/ui/card'

export type TestimonialItem = {
  _id?: string
  quote: string
  author: string
  role: string
  church: string
}

export type TestimonialsProps = {
  eyebrow: string
  heading: string
  lead?: string
  items: TestimonialItem[]
}

export const FALLBACK_TESTIMONIALS: TestimonialsProps = {
  eyebrow: 'From churches like yours',
  heading: 'Ministries running on Shiriki.',
  lead: 'Finance teams, welcome desks, and pastors trust Shiriki for Sunday giving and everyday ministry.',
  items: [
    {
      quote:
        "Reconciliation used to take our finance team an entire week after every fundraiser. Now the dashboard matches every M-Pesa transaction to a member automatically — it takes minutes.",
      author: 'Grace Wanjiru',
      role: 'Finance Administrator',
      church: 'Emmanuel Community Church, Nairobi',
    },
    {
      quote:
        'The USSD code means our older members and anyone without a smartphone can still give and get an SMS receipt. Nobody is left out of giving anymore.',
      author: 'Pastor Samuel Otieno',
      role: 'Senior Pastor',
      church: 'Living Waters Chapel, Kisumu',
    },
    {
      quote:
        'We moved from three different WhatsApp groups and a paper attendance register to one system. Visitor follow-up alone has doubled our second-visit rate.',
      author: 'Faith Nakato',
      role: 'Membership Coordinator',
      church: 'Cornerstone Fellowship, Eldoret',
    },
  ],
}

/**
 * Testimonial quote cards from churches using the platform. Renders nothing
 * if there are no testimonials, so an empty Sanity result degrades cleanly.
 */
export function Testimonials({ eyebrow, heading, lead, items }: TestimonialsProps) {
  if (items.length === 0) return null

  return (
    <section className="py-20 lg:py-28">
      <Container className="flex flex-col gap-12">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          {lead ? <p className="mt-5 text-lg leading-8 text-muted-foreground">{lead}</p> : null}
        </Reveal>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item._id ?? item.author}>
              <Card className="h-full shadow-brand-sm">
                <CardContent className="flex h-full flex-col gap-4">
                  <p className="text-lg italic leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-auto flex flex-col">
                    <span className="text-sm font-semibold">{item.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.role}, {item.church}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}
