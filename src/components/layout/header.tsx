'use client'

import * as React from 'react'
import Link from 'next/link'

import { APP_SIGNIN_URL, APP_SIGNUP_URL } from '@/lib/site'
import { cn } from '@/lib/utils'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { MAIN_NAV } from '@/lib/nav'

const emptySubscribe = () => () => {}

/** True only once mounted on the client, to avoid an SSR/CSR scroll-state mismatch. */
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

/**
 * Sticky, translucent site header. Backdrop-blurred at all times; grows a
 * hairline border + shadow once the page scrolls past the top so it reads as
 * "lifted" over content. Desktop nav uses `MAIN_NAV`; mobile collapses into
 * the `Sheet`-based `MobileNav`. The only client state here is scroll
 * position — nav data and copy are static.
 */
export function Header() {
  const mounted = useMounted()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,box-shadow] duration-200',
        // Transparent at rest so the header sits *in* the hero's tinted wash
        // rather than as a white bar laid over it; it only materialises into a
        // blurred surface once there is content scrolling underneath.
        mounted && scrolled
          ? 'border-border bg-background/85 shadow-brand-sm backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      {/* `wide` to match the home hero, so the wordmark sits on the same left
          edge as the `<h1>` under it rather than 130px inboard of it. */}
      <Container size="wide" className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="flex items-center gap-2" aria-label="Shiriki home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex" aria-label="Primary">
          {MAIN_NAV.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {/* The path into the product. This site had no link to the app at
              all, so a church leader who was convinced here had nowhere to
              go. "Request demo" is kept for those who want to talk first. */}
          <Link
            href={APP_SIGNIN_URL}
            className="hidden min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          {/* Visible at every width, including phones. It used to be hidden
              below `sm`, which left a phone visitor with no way into the app
              except opening the hamburger first — the one control on the page
              that has to be reachable in a single tap. */}
          <Link
            href={APP_SIGNUP_URL}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:px-4"
          >
            Get started
          </Link>
          <DemoRequestDialog>
            <button
              type="button"
              className="hidden min-h-11 items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 lg:inline-flex"
            >
              Request demo
            </button>
          </DemoRequestDialog>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  )
}
