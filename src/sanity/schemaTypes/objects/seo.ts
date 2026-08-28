import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: icon('search'),
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (Rule) => Rule.max(60).warning('Keep meta titles under 60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Keep meta descriptions under 160 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'No index',
      description: 'Hide this page from search engines and the sitemap.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
