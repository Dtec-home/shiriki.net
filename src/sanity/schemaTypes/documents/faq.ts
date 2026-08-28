import { defineField, defineType } from 'sanity'

import { portableTextBlocks } from '../blocks/portableText'
import { icon } from '../icon'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: icon('help-circle'),
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: portableTextBlocks,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
})
