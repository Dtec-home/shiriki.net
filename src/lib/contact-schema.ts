/**
 * Shared lead-capture validation (zod v4).
 *
 * Imported by BOTH the client forms (src/components/forms/*.tsx) and the
 * server actions (src/app/actions/contact.ts) so the rules the church admin
 * sees on-screen can never drift from what the server actually enforces.
 * Contains no secrets — safe to ship in the client bundle.
 *
 * Error copy is written for a non-technical church administrator filling in
 * the form on a phone, not a developer reading a stack trace.
 */

import { z } from 'zod'

import { MARKET_COUNTRIES } from '@/lib/site'

/** Countries offered in the form's country selector. Matches @/lib/site. */
export const CONTACT_COUNTRIES = MARKET_COUNTRIES

/**
 * Permissive phone check: accepts Kenyan local format (07xxxxxxxx /
 * 01xxxxxxxx), international E.164-ish (+254712345678), and general
 * groupings with spaces/dashes/parentheses. We deliberately do not enforce a
 * strict international format — church admins submit numbers from many
 * countries and dialing conventions, and a false rejection loses a lead.
 */
const phoneRegex = /^[+]?[\d\s()-]{7,20}$/

const phoneField = z
  .string()
  .trim()
  .max(20, 'That phone number looks too long — please check it.')
  .regex(phoneRegex, 'Please enter a valid phone number, e.g. 0712 345 678.')
  .optional()
  .or(z.literal(''))

/** Honeypot: real visitors never see or fill this field; bots often do. */
const honeypotField = z.string().max(0, 'Something went wrong. Please try again.').optional().or(z.literal(''))

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(100, 'That name is too long — please shorten it a little.'),
  email: z
    .email('Please enter a valid email address, like you@yourchurch.org.')
    .max(200, 'That email address is too long.'),
  phone: phoneField,
  churchName: z
    .string()
    .trim()
    .min(2, 'Please tell us the name of your church.')
    .max(120, 'That church name is too long — please shorten it a little.'),
  country: z.enum(CONTACT_COUNTRIES, {
    error: 'Please select the country your church is in.',
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little more about what you need (at least 10 characters).')
    .max(2000, 'Your message is a bit long — please keep it under 2000 characters.'),
  website: honeypotField,
})

export type ContactInput = z.infer<typeof contactSchema>

/** Buckets offered in the demo-request congregation-size selector. */
export const CONGREGATION_SIZES = ['<100', '100-500', '500-2000', '2000+'] as const
export type CongregationSize = (typeof CONGREGATION_SIZES)[number]

export const CONGREGATION_SIZE_LABELS: Record<CongregationSize, string> = {
  '<100': 'Under 100 members',
  '100-500': '100 – 500 members',
  '500-2000': '500 – 2,000 members',
  '2000+': 'Over 2,000 members',
}

export const demoRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(100, 'That name is too long — please shorten it a little.'),
  email: z
    .email('Please enter a valid email address, like you@yourchurch.org.')
    .max(200, 'That email address is too long.'),
  churchName: z
    .string()
    .trim()
    .min(2, 'Please tell us the name of your church.')
    .max(120, 'That church name is too long — please shorten it a little.'),
  phone: phoneField,
  congregationSize: z.enum(CONGREGATION_SIZES).optional().or(z.literal('')),
  website: honeypotField,
})

export type DemoRequestInput = z.infer<typeof demoRequestSchema>
