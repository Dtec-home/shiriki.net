import { defineField, defineType } from 'sanity'

import { icon } from '../icon'

/**
 * Code block for Portable Text. Uses the `code` input provided by the
 * `@sanity/code-input` plugin (registered in sanity.config.ts).
 */
export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'Code block',
  type: 'object',
  icon: icon('code-block'),
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'code',
      options: { withFilename: false },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { language: 'code.language', code: 'code.code' },
    prepare({ language, code }) {
      return {
        title: code ? String(code).split('\n')[0] : 'Code block',
        subtitle: language ? `Language: ${language}` : undefined,
      }
    },
  },
})
