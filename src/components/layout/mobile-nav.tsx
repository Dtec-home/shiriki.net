'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { MAIN_NAV } from '@/lib/nav'

/**
 * Mobile navigation drawer: a `Sheet` triggered by a labelled hamburger
 * button, listing the same links as the desktop nav plus the demo CTA. Every
 * link and the trigger meet the 44px touch-target minimum. Closes on link
 * activation.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open menu" className="size-11" />}>
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">Kanisa Connect</SheetTitle>
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

          <DemoRequestDialog>
            <button
              type="button"
              onClick={close}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"
            >
              Request demo
            </button>
          </DemoRequestDialog>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
