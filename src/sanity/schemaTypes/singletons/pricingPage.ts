import { defineArrayMember, defineField, defineType } from 'sanity'

import { icon } from '../icon'

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing page',
  type: 'document',
  icon: icon('credit-card'),
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
    }),
    defineField({
      name: 'plans',
      title: 'Plans',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'plan',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'priceKES',
              title: 'Price (KES)',
              type: 'number',
              description: 'Monthly price in Kenyan Shillings. Leave empty for "Custom".',
            }),
            defineField({
              name: 'period',
              title: 'Period',
              type: 'string',
              options: {
                list: [
                  { title: 'Per month', value: 'month' },
                  { title: 'Per year', value: 'year' },
                  { title: 'Custom', value: 'custom' },
                ],
              },
              initialValue: 'month',
            }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({
              name: 'features',
              title: 'Features',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({
              name: 'highlighted',
              title: 'Highlighted',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA label',
              type: 'string',
              initialValue: 'Get started',
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'priceKES' },
            prepare({ title, subtitle }) {
              return { title, subtitle: subtitle ? `KES ${subtitle}` : 'Custom pricing' }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'comparisonNote',
      title: 'Comparison note',
      type: 'text',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Pricing page' }
    },
  },
})
