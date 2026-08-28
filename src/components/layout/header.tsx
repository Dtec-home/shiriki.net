'use client'

import * as React from 'react'
import Link from 'next/link'
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
        'sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md transition-shadow duration-200',
        mounted && scrolled ? 'border-border shadow-brand-sm' : 'border-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="flex items-center gap-2" aria-label="Kanisa Connect home">
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
          <ThemeToggle />
          <DemoRequestDialog>
            <button
              type="button"
              className="hidden min-h-11 items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
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
