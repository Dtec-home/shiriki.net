import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: icon('tag'),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
