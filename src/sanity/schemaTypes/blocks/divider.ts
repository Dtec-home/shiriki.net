import { defineType } from 'sanity'

import { icon } from '../icon'

/** Visual horizontal rule for Portable Text. No meaningful fields — a marker. */
export const divider = defineType({
  name: 'divider',
  title: 'Divider',
  type: 'object',
  icon: icon('dot'),
  fields: [
    {
      name: 'style',
      title: 'Style',
      type: 'string',
      options: { list: [{ title: 'Line', value: 'line' }] },
      initialValue: 'line',
      hidden: true,
    },
  ],
  preview: {
    prepare() {
      return { title: '— Divider —' }
    },
  },
})
