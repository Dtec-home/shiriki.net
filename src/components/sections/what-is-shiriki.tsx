import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { SectionLabel } from '@/components/sections/section-label'
import { PLAY_STORE_URL, USSD_CODE } from '@/lib/site'

const LINKS = [
  { label: 'Giving channels', href: '/#giving', text: 'M-Pesa, Airtel Money, card and USSD, all on one ledger.' },
  { label: 'Features', href: '/#features', text: 'Members, attendance, events, SMS and finance.' },
  { label: 'Pricing', href: '/pricing', text: 'Plans in KES from 2,000 a month, 30 days free.' },
  { label: 'Android app', href: PLAY_STORE_URL, text: 'Giving history, receipts and announcements for members.' },
  { label: 'FAQ', href: '/faq', text: 'M-Pesa setup, data security, onboarding and more.' },
  { label: 'Blog', href: '/blog', text: 'Guides on church finance, giving and membership.' },
]

/**
 * Plain statement of what Shiriki is, near the foot of the home page.
 *
 * "Shiriki" is a common Swahili word other products share, so a search
 * engine needs the category spelled out in body copy — church management
 * system, ChMS, church funds management system, CFMS — not just in metadata,
 * which it weighs far less. The link grid under it names the site's main
 * sections in one place, which is the internal-link signal sitelinks are
 * drawn from.
 */
export function WhatIsShiriki() {
  return (
    <section aria-labelledby="what-is-shiriki-heading" className="py-20 lg:py-28">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionLabel className="text-primary">What is Shiriki</SectionLabel>
          <h2
            id="what-is-shiriki-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl"
          >
            A church management system and a church funds management system, in one.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Shiriki is church management software (ChMS) for African churches. It keeps your member
            register, attendance and communication in one place, and works as your church funds management
            system (CFMS): every tithe, offering and pledge — by M-Pesa STK Push, PayBill, Airtel Money, card
            or USSD {USSD_CODE} — is recorded against the member who gave it and the department it was
            given to, ready for the treasurer&apos;s report.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((link) => {
            const external = link.href.startsWith('http')
            return (
              <StaggerItem key={link.label}>
                <Link
                  href={link.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  className="group flex h-full flex-col gap-2 rounded-2xl border bg-card p-6 shadow-brand-sm transition-colors hover:border-primary/40"
                >
                  <span className="flex items-center justify-between font-bold">
                    {link.label}
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">{link.text}</span>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </Container>
    </section>
  )
}
