import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CtaBand } from '@/components/sections/cta-band'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMetadata } from '@/lib/metadata'
import { faqPageSchema } from '@/lib/json-ld'
import { sanityFetch } from '@/sanity/lib/fetch'
import { faqsQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'
import { FALLBACK_FAQS, type FaqDoc } from '@/lib/fallback-content'
import { SectionLabel } from '@/components/sections/section-label'

export const metadata: Metadata = buildMetadata({
  title: 'Frequently asked questions',
  description: 'Answers about M-Pesa integration, USSD giving, data security, pricing, onboarding, and offline use.',
  path: '/faq',
})


export default async function FaqPage() {
  const faqs = await sanityFetch<FaqDoc[], FaqDoc[]>(faqsQuery, {}, { next: { tags: [typeTag('faq')] } }, FALLBACK_FAQS)
  const items = faqs.length > 0 ? faqs : FALLBACK_FAQS

  const groups = new Map<string, FaqDoc[]>()
  for (const faq of items) {
    const category = faq.category || 'General'
    const existing = groups.get(category)
    if (existing) existing.push(faq)
    else groups.set(category, [faq])
  }

  const faqLd = faqPageSchema(items.map((f) => ({ question: f.question, answer: f.answer as unknown })))

  return (
    <>
      <JsonLd data={faqLd} />
      <Container
        as="div"
        className="grid grid-cols-1 gap-12 py-16 md:grid-cols-[300px_1fr] md:gap-16 md:py-24"
      >
        <Reveal className="flex flex-col gap-4 md:border-r md:pr-8">
          <SectionLabel className="text-primary">Support</SectionLabel>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Reach out and our team will help.
          </p>
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Contact us
          </Link>
        </Reveal>

        <div className="flex flex-col gap-10">
          {Array.from(groups.entries()).map(([category, categoryItems]) => (
            <div key={category} className="flex flex-col gap-2">
              {groups.size > 1 ? <h2 className="text-xl font-bold">{category}</h2> : null}
              <Accordion>
                {categoryItems.map((faq) => (
                  <AccordionItem key={faq._id} value={faq._id}>
                    <AccordionTrigger className="text-base font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <div className="max-w-[640px] leading-7 text-muted-foreground">
                        {typeof faq.answer === 'string' ? (
                          <p>{faq.answer}</p>
                        ) : (
                          <SectionErrorBoundary label={`FaqAnswer:${faq._id}`} silent>
                            <PortableTextRenderer value={faq.answer} className="text-base" />
                          </SectionErrorBoundary>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Container>

      <CtaBand heading="Still have questions?" sub="Our team is happy to walk through your church's specific setup." ctaLabel="Talk to our team" />
    </>
  )
}
