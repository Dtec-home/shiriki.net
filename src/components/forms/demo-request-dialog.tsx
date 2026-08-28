'use client'

import * as React from 'react'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CONGREGATION_SIZES, CONGREGATION_SIZE_LABELS } from '@/lib/contact-schema'
import { submitDemoRequest, type FormState } from '@/app/actions/contact'

const initialState: FormState = { status: 'idle' }

function fieldError(state: FormState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0]
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="min-h-11 min-w-40 gap-2">
      {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Sending…' : 'Request demo'}
    </Button>
  )
}

/**
 * Demo-request dialog (Sprint 5). Renders its own gold "Request demo"
 * trigger when no `children` are given, or wraps whatever trigger the
 * caller passes in (`asChild`) — other sections/pages rely on both.
 *
 * On success the form is replaced in-place with a confirmation state rather
 * than closing the dialog abruptly, so the visitor sees the outcome before
 * dismissing it themselves.
 */
export function DemoRequestDialog({ children }: { children?: React.ReactNode }) {
  const [state, formAction] = useActionState(submitDemoRequest, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [congregationSize, setCongregationSize] = useState('')
  const [open, setOpen] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const handledRef = useRef<FormState | null>(null)

  useEffect(() => {
    if (state === handledRef.current) return
    handledRef.current = state

    if (state.status === 'success') {
      trackEvent(ANALYTICS_EVENTS.DEMO_REQUEST_SUCCEEDED)
      toast.success(state.message ?? "Thanks — we'll be in touch within one business day.")
      // eslint-disable-next-line react-hooks/set-state-in-effect -- swapping the dialog to its confirmation state in response to a server action result, guarded above so it runs once per response
      setSucceeded(true)
    } else if (state.status === 'error') {
      trackEvent(ANALYTICS_EVENTS.DEMO_REQUEST_FAILED)
      toast.error(state.message ?? 'Something went wrong. Please try again.')
    }
  }, [state])

  // Reset the form state whenever the dialog is closed, so reopening it
  // starts fresh instead of showing a stale confirmation or errors.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) trackEvent(ANALYTICS_EVENTS.DEMO_DIALOG_OPENED)
    setOpen(nextOpen)
    if (!nextOpen) {
      window.setTimeout(() => {
        setSucceeded(false)
        setCongregationSize('')
        formRef.current?.reset()
        handledRef.current = null
      }, 200)
    }
  }

  const nameError = fieldError(state, 'name')
  const emailError = fieldError(state, 'email')
  const phoneError = fieldError(state, 'phone')
  const churchNameError = fieldError(state, 'churchName')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children ? (
        <DialogTrigger render={children as React.ReactElement} />
      ) : (
        <DialogTrigger render={<Button size="lg" />}>Request demo</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{succeeded ? "You're on the list" : 'Request a demo'}</DialogTitle>
          <DialogDescription>
            {succeeded
              ? "We'll be in touch within one business day to schedule a time that works for your church."
              : "Tell us a little about your church and we'll set up a walkthrough tailored to your congregation."}
          </DialogDescription>
        </DialogHeader>

        {succeeded ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2Icon className="size-10 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Keep an eye on your inbox — we&rsquo;ve sent a confirmation email too.
            </p>
            <DialogClose render={<Button variant="outline" className="mt-2 min-h-11" />}>Close</DialogClose>
          </div>
        ) : (
          <form
            ref={formRef}
            action={formAction}
            noValidate
            onSubmit={() => trackEvent(ANALYTICS_EVENTS.DEMO_REQUEST_SUBMITTED)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-name">Full name</Label>
              <Input
                id="demo-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                className="min-h-11"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? 'demo-name-error' : undefined}
              />
              {nameError && (
                <p id="demo-name-error" role="alert" className="text-sm text-destructive">
                  {nameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-email">Email address</Label>
              <Input
                id="demo-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-11"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'demo-email-error' : undefined}
              />
              {emailError && (
                <p id="demo-email-error" role="alert" className="text-sm text-destructive">
                  {emailError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-church">Church name</Label>
              <Input
                id="demo-church"
                name="churchName"
                type="text"
                autoComplete="organization"
                required
                minLength={2}
                maxLength={120}
                className="min-h-11"
                aria-invalid={churchNameError ? true : undefined}
                aria-describedby={churchNameError ? 'demo-church-error' : undefined}
              />
              {churchNameError && (
                <p id="demo-church-error" role="alert" className="text-sm text-destructive">
                  {churchNameError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-phone">
                Phone number <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="demo-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0712 345 678"
                className="min-h-11"
                aria-invalid={phoneError ? true : undefined}
                aria-describedby={phoneError ? 'demo-phone-error' : undefined}
              />
              {phoneError && (
                <p id="demo-phone-error" role="alert" className="text-sm text-destructive">
                  {phoneError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-congregation-size">
                Congregation size <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Select
                name="congregationSize"
                value={congregationSize}
                onValueChange={(value) => setCongregationSize(String(value ?? ''))}
              >
                <SelectTrigger id="demo-congregation-size" className="min-h-11 w-full">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {CONGREGATION_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {CONGREGATION_SIZE_LABELS[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Honeypot — see contact-form.tsx for the rationale. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
              <Label htmlFor="demo-website">Website</Label>
              <Input id="demo-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div aria-live="polite" className="sr-only">
              {state.status === 'error' && state.message}
            </div>

            <DialogFooter>
              <SubmitButton />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
