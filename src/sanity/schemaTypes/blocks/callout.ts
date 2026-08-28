import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

/** Inline/block callout for Portable Text: an info/success/warning note. */
export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: icon('info-outline'),
  fields: [
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Success', value: 'success' },
          { title: 'Warning', value: 'warning' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'text', tone: 'tone' },
    prepare({ title, tone }) {
      return { title, subtitle: `Callout (${tone})` }
    },
  },
})
