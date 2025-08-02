import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Display Style',
      defaultValue: 'card',
      required: true,
      options: [
        {
          label: 'Card (Default) - With border and background',
          value: 'card',
        },
        {
          label: 'Clean Card - No border, clean background',
          value: 'cleanCard',
        },
        {
          label: 'Inline - Simple, stays within content width',
          value: 'inline',
        },
        {
          label: 'Full Width - Stretches edge to edge',
          value: 'fullwidth',
        },
        {
          label: 'Hero Style - Full width with overlay caption',
          value: 'hero',
        },
      ],
      admin: {
        description: 'Choose how this media block should be displayed on the page',
      },
    },
  ],
}
