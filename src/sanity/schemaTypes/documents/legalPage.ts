import { defineField, defineType } from 'sanity'

import { portableTextBlocks } from '../blocks/portableText'
import { icon } from '../icon'

/**
 * Legal pages (privacy policy, terms of service) — a regular document type,
 * not a singleton, so multiple legal pages can exist side by side
 * (distinguished by `slug.current`: "privacy", "terms", ...).
 */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: icon('document'),
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
      description: 'e.g. "privacy" or "terms"',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: portableTextBlocks,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
