import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { JsonLd } from '@/components/seo/json-ld'
import { ScrollDepth } from '@/components/analytics/scroll-depth'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { organizationSchema, websiteSchema } from '@/lib/json-ld'

/**
 * Public site shell: skip-to-content link, sticky `Header`, `<main>`,
 * `Footer`, and the floating WhatsApp button, wrapped around every route in
 * the `(site)` group. Organization + WebSite JSON-LD is rendered here so it
 * appears on every page. `/studio` is outside this group, so the button does
 * not overlay the Sanity Studio.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ScrollDepth />
    </>
  )
}
