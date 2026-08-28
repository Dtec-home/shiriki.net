import { defineArrayMember, defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: icon('cog'),
  groups: [
    { name: 'brand', title: 'Brand', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'nav', title: 'Navigation' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Church / product name',
      type: 'string',
      group: 'brand',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'brand',
    }),
    defineField({
      name: 'logo',
      title: 'Logo (light backgrounds)',
      type: 'image',
      group: 'brand',
      options: { hotspot: true },
    }),
    defineField({
      name: 'logoDark',
      title: 'Logo (dark backgrounds)',
      type: 'image',
      group: 'brand',
      options: { hotspot: true },
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'contact',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'salesEmail',
      title: 'Sales email',
      type: 'string',
      group: 'contact',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'ussdCode',
      title: 'USSD code',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'streetAddress', title: 'Street address', type: 'string' }),
        defineField({ name: 'addressLocality', title: 'City / locality', type: 'string' }),
        defineField({ name: 'addressRegion', title: 'Region', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Postal code', type: 'string' }),
        defineField({ name: 'addressCountry', title: 'Country code', type: 'string' }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({ type: 'socialLink' })],
    }),
    defineField({
      name: 'footerBlurb',
      title: 'Footer blurb',
      type: 'text',
      group: 'brand',
    }),
    defineField({
      name: 'navLinks',
      title: 'Nav links',
      type: 'array',
      group: 'nav',
      of: [defineArrayMember({ type: 'ctaLink' })],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site settings' }
    },
  },
})
