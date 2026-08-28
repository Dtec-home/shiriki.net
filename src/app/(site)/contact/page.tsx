import type { Metadata } from 'next'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { ContactForm } from '@/components/forms/contact-form'
import { buildMetadata } from '@/lib/metadata'
import { CONTACT_EMAIL, CONTACT_PHONE, ORGANIZATION_ADDRESS, SALES_EMAIL, USSD_CODE } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Contact us',
  description: 'Talk to the Shiriki team about giving, membership, and communication tools for your church.',
  path: '/contact',
})

const CONTACT_DETAILS = [
  { icon: Mail, label: 'General enquiries', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: Mail, label: 'Sales & demos', value: SALES_EMAIL, href: `mailto:${SALES_EMAIL}` },
  { icon: Phone, label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s+/g, '')}` },
  { icon: MessageCircle, label: 'USSD (no internet needed)', value: USSD_CODE, href: undefined },
]

export default function ContactPage() {
  return (
    <Container as="div" className="grid grid-cols-1 gap-16 py-16 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <Reveal className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Contact</span>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Let&apos;s talk about your church.</h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Whether you&apos;re exploring Shiriki for the first time or need support with an existing account,
            our team is ready to help.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {CONTACT_DETAILS.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-semibold hover:text-primary">
                    {item.value}
                  </a>
                ) : (
                  <p className="font-mono font-semibold">{item.value}</p>
                )}
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <MapPin className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Office</p>
              <address className="not-italic font-semibold">
                {ORGANIZATION_ADDRESS.streetAddress}, {ORGANIZATION_ADDRESS.addressLocality}{' '}
                {ORGANIZATION_ADDRESS.postalCode}, {ORGANIZATION_ADDRESS.addressRegion}
              </address>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Response time</p>
              <p className="font-semibold">Within 1 business day, Monday–Friday, 8am–5pm EAT</p>
            </div>
          </li>
        </ul>
      </Reveal>

      <Reveal delay={0.08} className="rounded-3xl border bg-card p-6 shadow-brand-md md:p-8">
        <h2 className="text-xl font-bold">Send us a message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the form and a member of our team will get back to you shortly.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </Reveal>
    </Container>
  )
}
