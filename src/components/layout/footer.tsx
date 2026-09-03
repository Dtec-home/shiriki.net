import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { SocialIcon } from '@/components/layout/social-icon'
import { FOOTER_NAV } from '@/lib/nav'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  ORGANIZATION_ADDRESS,
  SITE_TAGLINE,
  SOCIAL_LINKS,
  USSD_CODE,
} from '@/lib/site'
import { sanityFetch } from '@/sanity/lib/fetch'
import { siteSettingsQuery } from '@/sanity/lib/queries'
import { typeTag } from '@/sanity/lib/live'

type FooterSiteSettings = {
  footerBlurb?: string | null
}

const FALLBACK_SITE_SETTINGS: FooterSiteSettings = {
  footerBlurb: SITE_TAGLINE,
}

/**
 * Multi-column site footer on the indigo `bg-primary` surface: brand + blurb,
 * the `FOOTER_NAV` link columns, social links, contact details, and a legal
 * row. The blurb comes from Sanity `siteSettings` with a hardcoded fallback —
 * everything else (nav, contact, socials) is the static brand data from
 * `@/lib/site` and `@/lib/nav`, so the footer is always complete even with
 * no Sanity project configured.
 */
export async function Footer() {
  const siteSettings = await sanityFetch<FooterSiteSettings, FooterSiteSettings>(
    siteSettingsQuery,
    {},
    { next: { tags: [typeTag('siteSettings')] } },
    FALLBACK_SITE_SETTINGS,
  )
  const blurb = siteSettings?.footerBlurb || FALLBACK_SITE_SETTINGS.footerBlurb
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="flex flex-col gap-12 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center focus-visible:outline-primary-foreground"
              aria-label="Shiriki home"
            >
              <Logo tone="inverted" />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/70">{blurb}</p>
            <ul className="flex flex-col gap-1.5 pt-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-8 items-center hover:text-primary-foreground focus-visible:outline-primary-foreground"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
                  className="inline-flex min-h-8 items-center hover:text-primary-foreground focus-visible:outline-primary-foreground"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span>
                  {ORGANIZATION_ADDRESS.streetAddress}, {ORGANIZATION_ADDRESS.addressLocality}
                </span>
              </li>
              <li className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-secondary dark:text-primary-foreground">
                <span>USSD {USSD_CODE}</span>
              </li>
            </ul>
            {SOCIAL_LINKS.length > 0 ? (
              <ul className="flex gap-3 pt-2" aria-label="Social links">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="flex size-11 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/80 transition-colors hover:border-primary-foreground/40 hover:text-primary-foreground focus-visible:outline-primary-foreground"
                    >
                      <SocialIcon platform={social.platform} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {FOOTER_NAV.map((column) => (
            <div key={column.heading} className="flex flex-col gap-1">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/70">
                {column.heading}
              </h2>
              <ul className="flex flex-col text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-11 items-center text-primary-foreground/80 hover:text-primary-foreground focus-visible:outline-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-primary-foreground/10 pt-6 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Shiriki. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center hover:text-primary-foreground focus-visible:outline-primary-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center hover:text-primary-foreground focus-visible:outline-primary-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
