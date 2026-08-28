import { defineArrayMember, defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: icon('home'),
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'problems', title: 'Problem band' },
    { name: 'sections', title: 'Sections' },
    { name: 'security', title: 'Security' },
    { name: 'ussd', title: 'USSD panel' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- Hero ---
    defineField({
      name: 'heroEyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Subheadline',
      type: 'text',
      group: 'hero',
    }),
    defineField({
      name: 'heroPrimaryCta',
      title: 'Primary CTA',
      type: 'ctaLink',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCta',
      title: 'Secondary CTA',
      type: 'ctaLink',
      group: 'hero',
    }),
    defineField({
      name: 'heroBadgeText',
      title: 'Hero badge text',
      type: 'string',
      group: 'hero',
    }),

    // --- Problem band ---
    defineField({
      name: 'problemBandEyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'problems',
    }),
    defineField({
      name: 'problemBandHeading',
      title: 'Heading',
      type: 'string',
      group: 'problems',
    }),
    defineField({
      name: 'problemBandIntro',
      title: 'Intro',
      type: 'text',
      group: 'problems',
    }),
    defineField({
      name: 'problems',
      title: 'Problems',
      type: 'array',
      group: 'problems',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'problem',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text' }),
            defineField({ name: 'icon', title: 'Icon', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),

    // --- Section intros ---
    defineField({
      name: 'givingSectionHeading',
      title: 'Giving section heading',
      type: 'string',
      group: 'sections',
    }),
    defineField({
      name: 'givingSectionIntro',
      title: 'Giving section intro',
      type: 'text',
      group: 'sections',
    }),
    defineField({
      name: 'featuresSectionHeading',
      title: 'Features section heading',
      type: 'string',
      group: 'sections',
    }),
    defineField({
      name: 'featuresSectionIntro',
      title: 'Features section intro',
      type: 'text',
      group: 'sections',
    }),
    defineField({
      name: 'digitalHomeHeading',
      title: 'Digital home heading',
      type: 'string',
      group: 'sections',
    }),
    defineField({
      name: 'digitalHomeIntro',
      title: 'Digital home intro',
      type: 'text',
      group: 'sections',
    }),

    // --- Security ---
    defineField({
      name: 'securityHeading',
      title: 'Security heading',
      type: 'string',
      group: 'security',
    }),
    defineField({
      name: 'securityIntro',
      title: 'Security intro',
      type: 'text',
      group: 'security',
    }),
    defineField({
      name: 'securityBadges',
      title: 'Security badges',
      type: 'array',
      group: 'security',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'securityBadge',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'icon' } },
        }),
      ],
    }),

    // --- USSD panel ---
    defineField({
      name: 'ussdPanel',
      title: 'USSD panel',
      type: 'object',
      group: 'ussd',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'code', title: 'Code', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text' }),
        defineField({ name: 'cta', title: 'CTA', type: 'ctaLink' }),
      ],
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home page' }
    },
  },
})
