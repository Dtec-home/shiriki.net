'use server'

/**
 * Server actions for the two lead-capture forms (general contact + demo
 * request). Both follow the same pipeline:
 *
 *   1. Honeypot check — if the hidden `website` field is filled, pretend to
 *      succeed and do nothing else. Never tell a bot it was caught.
 *   2. Rate limit by client IP (5 requests/minute, in-memory — see
 *      @/lib/rate-limit) so a single visitor (or bot) can't hammer the form.
 *   3. Validate with the SHARED zod schema (@/lib/contact-schema) — the same
 *      rules the client already checked, re-checked server-side.
 *   4. Write an `inquiry` document to Sanity via the server-only write
 *      client, in its own try/catch.
 *   5. Send a Resend notification to the sales inbox + a short
 *      acknowledgement to the submitter, in its own try/catch.
 *   6. Return a typed FormState the client maps to a sonner toast.
 *
 * GRACEFUL DEGRADATION (hard requirement — see docs/CONTRACTS.md):
 * This app must work with no Sanity project and no Resend key. Each backend
 * call is wrapped independently so one failing service never loses a lead
 * captured by the other. The overall policy:
 *
 *   - Sanity write succeeded, OR the Resend notification succeeded  →
 *     "success" to the user (the lead was captured *somewhere*).
 *   - Neither backend is even configured (no write token, no API key) →
 *     in development, return a friendly fake "success" (so the UI can be
 *     built/demoed without secrets); in production, return a clear error
 *     telling the visitor to email us directly.
 *   - A backend WAS configured but the call actually failed (bad token,
 *     network error, Resend rejected the request, …) → return an error
 *     asking the visitor to email us directly. We never expose which
 *     backend failed, and never leak a stack trace to the client.
 */

import crypto from 'node:crypto'
import { headers } from 'next/headers'
import { Resend } from 'resend'

import {
  contactSchema,
  demoRequestSchema,
  CONGREGATION_SIZE_LABELS,
  type CongregationSize,
} from '@/lib/contact-schema'
import { checkRateLimit } from '@/lib/rate-limit'
import { CONTACT_EMAIL, SALES_EMAIL, SITE_NAME } from '@/lib/site'
import { hasWriteToken, writeClient } from '@/sanity/lib/write-client'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Env / config
// ---------------------------------------------------------------------------

const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `${SITE_NAME} <hello@shiriki.site>`
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || SALES_EMAIL
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0)
}

const FRIENDLY_UNREACHABLE_MESSAGE = `Sorry — we couldn't reach our servers just now. Please email us directly at ${CONTACT_EMAIL} and we'll get back to you.`
const FRIENDLY_RATE_LIMIT_MESSAGE = "You're submitting a little fast — please wait a moment and try again."
const FRIENDLY_VALIDATION_MESSAGE = 'Please check the highlighted fields and try again.'

// ---------------------------------------------------------------------------
// Client IP / rate limiting
// ---------------------------------------------------------------------------

async function getClientKey(formName: string): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  const ip = (forwarded ? forwarded.split(',')[0]?.trim() : undefined) || headerList.get('x-real-ip')?.trim() || 'unknown'
  return `${formName}:${ip}`
}

// ---------------------------------------------------------------------------
// Email builders
// ---------------------------------------------------------------------------

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

type NotifyRow = { label: string; value: string }

function buildNotificationEmail(subject: string, rows: NotifyRow[], message?: string) {
  const textLines = [subject, '', ...rows.map((r) => `${r.label}: ${r.value}`)]
  if (message) textLines.push('', 'Message:', message)
  const text = textLines.join('\n')

  const htmlRows = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${escapeHtml(r.label)}</td><td>${escapeHtml(r.value)}</td></tr>`
    )
    .join('')
  const html = `
    <div style="font-family:sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
      <table style="border-collapse:collapse">${htmlRows}</table>
      ${message ? `<p style="white-space:pre-wrap;margin-top:16px">${escapeHtml(message)}</p>` : ''}
    </div>
  `.trim()

  return { text, html, subject }
}

function buildAckEmail(name: string, kind: 'contact' | 'demo') {
  const firstName = name.trim().split(/\s+/)[0] || 'there'
  const subject =
    kind === 'demo' ? `We've got your demo request, ${firstName}` : `We've received your message, ${firstName}`
  const body =
    kind === 'demo'
      ? `Thanks for requesting a demo of ${SITE_NAME}. Our team will reach out within one business day to schedule a time that works for your church.`
      : `Thanks for reaching out to ${SITE_NAME}. Our team has received your message and will get back to you shortly.`
  const text = `Hi ${firstName},\n\n${body}\n\n— The ${SITE_NAME} team`
  const html = `
    <div style="font-family:sans-serif;font-size:14px;color:#111">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>${escapeHtml(body)}</p>
      <p>— The ${escapeHtml(SITE_NAME)} team</p>
    </div>
  `.trim()
  return { text, html, subject }
}

// ---------------------------------------------------------------------------
// Shared delivery step (Sanity write + Resend notify/ack)
// ---------------------------------------------------------------------------

type DeliverInput = {
  name: string
  email: string
  phone?: string
  churchName: string
  country?: string
  message: string
  source: 'contact' | 'demo'
  notifySubject: string
  notifyRows: NotifyRow[]
}

async function deliverInquiry(input: DeliverInput): Promise<{ delivered: boolean; attempted: boolean }> {
  let sanityOk = false
  let resendOk = false
  const sanityAttempted = hasWriteToken()
  const resendAttempted = resendConfigured()

  // 4. Sanity write — its own try/catch so an email failure never loses a
  // lead the CMS already has, and vice versa.
  //
  // SECURITY: `_id` is dot-namespaced (`inquiry.<uuid>`) rather than a bare
  // id. Sanity treats a leading-segment dot in `_id` as marking the document
  // outside the default public read grant (`path("*")` does not match
  // dot-prefixed ids), so an `inquiry` document is only readable with an
  // authenticated/token request — never through the public dataset API.
  // This keeps submitters' names, emails and phone numbers private even
  // though the dataset itself may otherwise be publicly readable.
  if (sanityAttempted) {
    try {
      await writeClient.create({
        _id: `inquiry.${crypto.randomUUID()}`,
        _type: 'inquiry',
        name: input.name,
        email: input.email,
        phone: input.phone || undefined,
        churchName: input.churchName,
        country: input.country || undefined,
        message: input.message,
        source: input.source,
        status: 'new',
        createdAt: new Date().toISOString(),
      })
      sanityOk = true
    } catch (error) {
      console.error('[contact] Sanity inquiry write failed:', (error as Error).message)
    }
  } else {
    console.warn('[contact] SANITY_API_WRITE_TOKEN not configured — skipping inquiry write.')
  }

  // 5. Resend notification + submitter acknowledgement — also isolated.
  if (resendAttempted) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const notify = buildNotificationEmail(input.notifySubject, input.notifyRows, input.message)
      const { error } = await resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        replyTo: input.email,
        subject: notify.subject,
        text: notify.text,
        html: notify.html,
      })
      if (error) {
        console.error('[contact] Resend notification failed:', error)
      } else {
        resendOk = true
      }

      // Best-effort auto-acknowledgement — failure here should never block
      // the lead from counting as delivered.
      try {
        const ack = buildAckEmail(input.name, input.source)
        await resend.emails.send({
          from: CONTACT_FROM_EMAIL,
          to: input.email,
          subject: ack.subject,
          text: ack.text,
          html: ack.html,
        })
      } catch (ackError) {
        console.error('[contact] Resend acknowledgement failed:', (ackError as Error).message)
      }
    } catch (error) {
      console.error('[contact] Resend threw:', (error as Error).message)
    }
  } else {
    console.warn('[contact] RESEND_API_KEY not configured — skipping notification email.')
  }

  return { delivered: sanityOk || resendOk, attempted: sanityAttempted || resendAttempted }
}

// ---------------------------------------------------------------------------
// submitContact
// ---------------------------------------------------------------------------

export async function submitContact(_prevState: FormState, formData: FormData): Promise<FormState> {
  const key = await getClientKey('contact')
  const rate = checkRateLimit(key, 5, 60_000)
  if (!rate.ok) {
    return { status: 'error', message: FRIENDLY_RATE_LIMIT_MESSAGE }
  }

  const parsed = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    churchName: formData.get('churchName') ?? '',
    country: formData.get('country') ?? '',
    message: formData.get('message') ?? '',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: FRIENDLY_VALIDATION_MESSAGE,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data

  // 1. Honeypot — silently "succeed" without doing anything real.
  if (data.website) {
    console.warn('[contact] honeypot triggered on contact form — dropping submission silently.')
    return { status: 'success', message: "Thanks — we'll be in touch soon." }
  }

  const result = await deliverInquiry({
    name: data.name,
    email: data.email,
    phone: data.phone,
    churchName: data.churchName,
    country: data.country,
    message: data.message,
    source: 'contact',
    notifySubject: `New contact inquiry from ${data.name} (${data.churchName})`,
    notifyRows: [
      { label: 'Name', value: data.name },
      { label: 'Email', value: data.email },
      { label: 'Phone', value: data.phone || '—' },
      { label: 'Church', value: data.churchName },
      { label: 'Country', value: data.country },
    ],
  })

  if (result.delivered) {
    return { status: 'success', message: "Thanks — we'll be in touch soon." }
  }

  if (!result.attempted && !IS_PRODUCTION) {
    // No backend configured at all — acceptable in local/dev so the form UI
    // can be built and demoed without secrets. Never do this in production.
    console.warn('[contact] no backend configured (dev mode) — returning a fake success.')
    return { status: 'success', message: "Thanks — we'll be in touch soon." }
  }

  return { status: 'error', message: FRIENDLY_UNREACHABLE_MESSAGE }
}

// ---------------------------------------------------------------------------
// submitDemoRequest
// ---------------------------------------------------------------------------

export async function submitDemoRequest(_prevState: FormState, formData: FormData): Promise<FormState> {
  const key = await getClientKey('demo')
  const rate = checkRateLimit(key, 5, 60_000)
  if (!rate.ok) {
    return { status: 'error', message: FRIENDLY_RATE_LIMIT_MESSAGE }
  }

  const rawCongregationSize = formData.get('congregationSize')

  const parsed = demoRequestSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    churchName: formData.get('churchName') ?? '',
    phone: formData.get('phone') ?? '',
    congregationSize: rawCongregationSize ?? '',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: FRIENDLY_VALIDATION_MESSAGE,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data

  if (data.website) {
    console.warn('[contact] honeypot triggered on demo-request form — dropping submission silently.')
    return { status: 'success', message: "Thanks — we'll be in touch within one business day." }
  }

  const sizeLabel = data.congregationSize
    ? CONGREGATION_SIZE_LABELS[data.congregationSize as CongregationSize]
    : undefined

  const result = await deliverInquiry({
    name: data.name,
    email: data.email,
    phone: data.phone,
    churchName: data.churchName,
    message: sizeLabel
      ? `Demo request. Congregation size: ${sizeLabel}.`
      : 'Demo request.',
    source: 'demo',
    notifySubject: `New demo request from ${data.name} (${data.churchName})`,
    notifyRows: [
      { label: 'Name', value: data.name },
      { label: 'Email', value: data.email },
      { label: 'Phone', value: data.phone || '—' },
      { label: 'Church', value: data.churchName },
      { label: 'Congregation size', value: sizeLabel || '—' },
    ],
  })

  if (result.delivered) {
    return { status: 'success', message: "Thanks — we'll be in touch within one business day." }
  }

  if (!result.attempted && !IS_PRODUCTION) {
    console.warn('[contact] no backend configured (dev mode) — returning a fake success.')
    return { status: 'success', message: "Thanks — we'll be in touch within one business day." }
  }

  return { status: 'error', message: FRIENDLY_UNREACHABLE_MESSAGE }
}
