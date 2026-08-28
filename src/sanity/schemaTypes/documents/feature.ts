import { defineArrayMember, defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const feature = defineType({
  name: 'feature',
  title: 'Feature',
  type: 'document',
  icon: icon('sparkles'),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'bullets',
      title: 'Bullets',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'emphasis',
      title: 'Emphasis',
      description: 'Highlight this feature as a headline feature.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
