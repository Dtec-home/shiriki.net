import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

/** Pull-quote block for Portable Text, distinct from the "Quote" block style. */
export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Quote block',
  type: 'object',
  icon: icon('blockquote'),
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'quote', subtitle: 'attribution' },
  },
})
