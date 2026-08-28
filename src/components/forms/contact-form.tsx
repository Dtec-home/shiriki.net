'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CONTACT_COUNTRIES } from '@/lib/contact-schema'
import { submitContact, type FormState } from '@/app/actions/contact'

const initialState: FormState = { status: 'idle' }

function fieldError(state: FormState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0]
}

/**
 * Submit button that reads pending state from the surrounding <form> via
 * useFormStatus — it must be a descendant of the <form>, not the component
 * that owns useActionState, which is why it's split out.
 */
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="min-h-11 min-w-36 gap-2 self-start">
      {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  )
}

/**
 * General contact form (Sprint 5). Submits via the `submitContact` server
 * action through native form action progressive enhancement — no client
 * fetch, no exposed secrets. Field errors returned by the server (after
 * re-validating with the same zod schema) are surfaced next to each input.
 */
export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [country, setCountry] = useState('')
  const handledRef = useRef<FormState | null>(null)

  useEffect(() => {
    if (state === handledRef.current) return
    handledRef.current = state

    // A fresh `state` here means the server action just completed — this is
    // the one legitimate place to synchronize with the external toast system
    // and reset the (uncontrolled) form/select in response to that result,
    // not a value derivable during render.
    if (state.status === 'success') {
      trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUCCEEDED)
      toast.success(state.message ?? "Thanks — we'll be in touch soon.")
      formRef.current?.reset()
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the controlled Select to match the just-reset native form, guarded above so it runs once per response
      setCountry('')
    } else if (state.status === 'error') {
      trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_FAILED)
      toast.error(state.message ?? 'Something went wrong. Please try again.')
    }
  }, [state])

  const nameError = fieldError(state, 'name')
  const emailError = fieldError(state, 'email')
  const phoneError = fieldError(state, 'phone')
  const churchNameError = fieldError(state, 'churchName')
  const countryError = fieldError(state, 'country')
  const messageError = fieldError(state, 'message')

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={() => trackEvent(ANALYTICS_EVENTS.CONTACT_FORM_SUBMITTED)}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Full name</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="min-h-11"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'contact-name-error' : undefined}
          />
          {nameError && (
            <p id="contact-name-error" role="alert" className="text-sm text-destructive">
              {nameError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-11"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'contact-email-error' : undefined}
          />
          {emailError && (
            <p id="contact-email-error" role="alert" className="text-sm text-destructive">
              {emailError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">
            Phone number <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            className="min-h-11"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? 'contact-phone-error' : undefined}
          />
          {phoneError && (
            <p id="contact-phone-error" role="alert" className="text-sm text-destructive">
              {phoneError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-church">Church name</Label>
          <Input
            id="contact-church"
            name="churchName"
            type="text"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={120}
            className="min-h-11"
            aria-invalid={churchNameError ? true : undefined}
            aria-describedby={churchNameError ? 'contact-church-error' : undefined}
          />
          {churchNameError && (
            <p id="contact-church-error" role="alert" className="text-sm text-destructive">
              {churchNameError}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-country">Country</Label>
        <Select name="country" value={country} onValueChange={(value) => setCountry(String(value ?? ''))}>
          <SelectTrigger
            id="contact-country"
            className="min-h-11 w-full"
            aria-invalid={countryError ? true : undefined}
            aria-describedby={countryError ? 'contact-country-error' : undefined}
          >
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_COUNTRIES.map((countryOption) => (
              <SelectItem key={countryOption} value={countryOption}>
                {countryOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countryError && (
          <p id="contact-country-error" role="alert" className="text-sm text-destructive">
            {countryError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={2000}
          className="min-h-28"
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? 'contact-message-error' : undefined}
        />
        {messageError && (
          <p id="contact-message-error" role="alert" className="text-sm text-destructive">
            {messageError}
          </p>
        )}
      </div>

      {/* Honeypot: genuinely hidden from sighted users AND assistive tech.
          Off-screen (not display:none, which some bots specifically detect
          and skip), unreachable by keyboard, and never announced. If a bot
          fills it in, the server silently pretends to succeed. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <Label htmlFor="contact-website">Website</Label>
        <Input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite" className="sr-only">
        {state.status === 'error' && state.message}
        {state.status === 'success' && state.message}
      </div>

      <SubmitButton />
    </form>
  )
}
