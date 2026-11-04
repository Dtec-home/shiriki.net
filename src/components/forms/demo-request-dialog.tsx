'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

import { Button } from '@/components/ui/button'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

/**
 * The dialog body (base-ui Dialog + Select + the form) is fetched on first
 * open, not with the page (sprint 2026-11 MKT-QA2, mobile Lighthouse). The
 * trigger is plain markup until then.
 */
const DemoRequestFormDialog = dynamic(() => import('@/components/forms/demo-request-form-dialog'), {
  ssr: false,
})

type HostProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Focus goes here when the dialog closes. */
  finalFocus: React.RefObject<HTMLElement | null>
}

/**
 * The demo dialog with no trigger of its own, for a caller that opens it from
 * elsewhere (the mobile menu opens it after closing itself). Mounts the
 * lazily loaded body the first time `open` is true and keeps it mounted.
 */
export function DemoDialogHost({ open, onOpenChange, finalFocus }: HostProps) {
  const [loaded, setLoaded] = React.useState(open)
  if (open && !loaded) setLoaded(true)
  React.useEffect(() => {
    if (open) trackEvent(ANALYTICS_EVENTS.DEMO_DIALOG_OPENED)
  }, [open])
  if (!loaded) return null
  return <DemoRequestFormDialog open={open} onOpenChange={onOpenChange} finalFocus={finalFocus} />
}

type TriggerElement = React.ReactElement<{
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  ref?: React.Ref<HTMLElement>
  'aria-haspopup'?: 'dialog'
  'aria-expanded'?: boolean
}>

/**
 * Demo-request dialog (Sprint 5). Renders its own "Request demo" button when
 * no `children` are given, or uses the single element the caller passes as
 * the trigger. Focus returns to that trigger when the dialog closes.
 */
export function DemoRequestDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)

  const trigger = React.isValidElement(children) ? (children as TriggerElement) : null
  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    trigger?.props.onClick?.(event)
    if (!event.defaultPrevented) setOpen(true)
  }
  const a11y = { 'aria-haspopup': 'dialog' as const, 'aria-expanded': open }

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger, { ...a11y, onClick, ref: triggerRef })
      ) : (
        <Button size="lg" {...a11y} onClick={onClick} ref={triggerRef as React.Ref<HTMLButtonElement>}>
          Request demo
        </Button>
      )}
      <DemoDialogHost open={open} onOpenChange={setOpen} finalFocus={triggerRef} />
    </>
  )
}
