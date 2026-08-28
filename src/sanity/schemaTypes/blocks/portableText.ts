import { defineArrayMember, defineField } from 'sanity'

/**
 * Shared rich Portable Text configuration used for every "rich" body field:
 * `post.body`, `faq.answer`, `aboutPage.mission`, `legalPage.body`.
 *
 * Includes:
 *  - Block styles: Normal, H2, H3, H4, Quote.
 *  - Lists: bullet, numbered.
 *  - Marks (decorators): Strong, Emphasis, Code.
 *  - Annotations: Link (href + open in new tab).
 *  - Custom embeddable block types: inline image (required alt), callout,
 *    codeBlock, quoteBlock, divider.
 */
export const portableTextBlocks = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H2', value: 'h2' },
      { title: 'H3', value: 'h3' },
      { title: 'H4', value: 'h4' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
      annotations: [
        defineField({
          name: 'link',
          title: 'Link',
          type: 'object',
          icon: () => '🔗',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({
                  allowRelative: true,
                  scheme: ['http', 'https', 'mailto', 'tel'],
                }),
            }),
            defineField({
              name: 'blank',
              title: 'Open in new tab',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        }),
      ],
    },
  }),
  // Custom embeddable block types
  defineArrayMember({
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        type: 'string',
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'caption',
        title: 'Caption',
        type: 'string',
      }),
    ],
  }),
  defineArrayMember({ type: 'callout' }),
  defineArrayMember({ type: 'codeBlock' }),
  defineArrayMember({ type: 'quoteBlock' }),
  defineArrayMember({ type: 'divider' }),
]
