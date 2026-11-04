'use client'

import * as React from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MAIN_NAV } from '@/lib/nav'
import { APP_SIGNIN_URL, APP_SIGNUP_URL } from '@/lib/site'

type MobileNavSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Focus goes here when the sheet closes: the menu button. */
  finalFocus: React.RefObject<HTMLElement | null>
  /** "Request demo": the parent closes the sheet and opens the demo dialog. */
  onRequestDemo: () => void
}

/**
 * The mobile navigation drawer itself, controlled and trigger-less. Loaded
 * on first open by `MobileNav` (MKT-QA2), so the sheet primitives are not in
 * the page's initial JavaScript. Every link meets the 44px touch-target
 * minimum and closes the sheet.
 */
export default function MobileNavSheet({ open, onOpenChange, finalFocus, onRequestDemo }: MobileNavSheetProps) {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm" finalFocus={finalFocus}>
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">Shiriki</SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4">
          <ul className="flex flex-col gap-1 py-2">
            {MAIN_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={APP_SIGNUP_URL}
            onClick={close}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Get started
          </Link>
          <Link
            href={APP_SIGNIN_URL}
            onClick={close}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Sign in
          </Link>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onRequestDemo}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"
          >
            Request demo
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
