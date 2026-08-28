import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const givingChannel = defineType({
  name: 'givingChannel',
  title: 'Giving channel',
  type: 'document',
  icon: icon('bill'),
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'Icon name (e.g. a lucide-react icon name) used by the front end.',
      type: 'string',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      description: 'Short badge text, e.g. "Instant" or "Most popular".',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'badge' },
  },
})
