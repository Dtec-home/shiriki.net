'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoDialogHost } from '@/components/forms/demo-request-dialog'

/** The drawer (base-ui Sheet) is fetched on first open, not with the page (MKT-QA2). */
const MobileNavSheet = dynamic(() => import('@/components/layout/mobile-nav-sheet'), { ssr: false })

/**
 * Mobile navigation: a labelled hamburger button that opens a `Sheet` with
 * the desktop nav's links plus the demo CTA. "Request demo" closes the sheet
 * and opens the demo dialog, which lives here rather than inside the sheet
 * so it survives the sheet unmounting; focus returns to the menu button
 * when either closes.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [demoOpen, setDemoOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  function openMenu() {
    setLoaded(true)
    setOpen(true)
  }

  function requestDemo() {
    setOpen(false)
    setDemoOpen(true)
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="size-11"
        onClick={openMenu}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      {loaded ? (
        <MobileNavSheet open={open} onOpenChange={setOpen} finalFocus={buttonRef} onRequestDemo={requestDemo} />
      ) : null}
      <DemoDialogHost open={demoOpen} onOpenChange={setDemoOpen} finalFocus={buttonRef} />
    </>
  )
}
