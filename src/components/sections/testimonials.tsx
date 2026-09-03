import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Card, CardContent } from '@/components/ui/card'
import { SectionLabel } from '@/components/sections/section-label'

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
  eyebrow: 'Churches using Shiriki',
  heading: 'Ministries running on Shiriki.',
  lead: 'Finance teams, welcome desks, and pastors, in their own words.',
  // Deliberately empty. The quotes that used to sit here named churches and
  // people who do not exist, which is not something to ship as social proof.
  // `Testimonials` renders nothing while this is empty, so the section stays
  // wired up and reappears as soon as real `testimonial` documents with
  // attributable quotes are published in Sanity.
  items: [],
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
          <SectionLabel className="text-primary">{eyebrow}</SectionLabel>
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
