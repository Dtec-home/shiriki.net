import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

/**
 * Contact / demo-request submissions. Created exclusively by the forms
 * server actions (Sprint 5) via a write-token-authenticated Sanity client —
 * never authored manually in the Studio. Every field is `readOnly` except
 * `status`, so editors can triage inquiries without altering the original
 * submission. The desk structure (see structure.ts) also removes the
 * "create new" action for this type.
 */
export const inquiry = defineType({
  name: 'inquiry',
  title: 'Inquiry',
  type: 'document',
  icon: icon('inbox'),
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'Email', type: 'string', readOnly: true }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true }),
    defineField({ name: 'churchName', title: 'Church name', type: 'string', readOnly: true }),
    defineField({ name: 'country', title: 'Country', type: 'string', readOnly: true }),
    defineField({ name: 'message', title: 'Message', type: 'text', readOnly: true }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Contact form', value: 'contact' },
          { title: 'Demo request', value: 'demo' },
        ],
      },
    }),
    defineField({ name: 'createdAt', title: 'Created at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Qualified', value: 'qualified' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
      validation: (Rule) => Rule.required(),
      // Status is the one field an admin needs to update while triaging
      // inquiries in the Studio, so it is intentionally NOT readOnly.
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'email', status: 'status' },
    prepare({ title, subtitle, status }) {
      return { title: title || '(no name)', subtitle: `${subtitle ?? ''} · ${status}` }
    },
  },
})
