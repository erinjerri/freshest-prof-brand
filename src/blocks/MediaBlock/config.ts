import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'sourceType',
      type: 'radio',
      defaultValue: 'upload',
      admin: { layout: 'horizontal' },
      options: [
        { label: 'Upload', value: 'upload' },
        { label: 'Embed (YouTube/Vimeo)', value: 'embed' },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (_, { sourceType } = {}) => sourceType !== 'embed',
      },
    },
    {
      name: 'embedUrl',
      type: 'text',
      admin: {
        condition: (_, { sourceType } = {}) => sourceType === 'embed',
        description: 'Paste a YouTube or Vimeo URL',
      },
      validate: (val, { siblingData }) => {
        if (siblingData?.sourceType === 'embed') {
          if (!val) return 'Embed URL is required'
          try {
            const u = new URL(val)
            if (!/(youtube|youtu\.be|vimeo)/i.test(u.hostname)) {
              return 'Only YouTube or Vimeo URLs are allowed'
            }
          } catch {
            return 'Invalid URL'
          }
        }
        return true
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Display Style',
      defaultValue: 'card',
      required: true,
      options: [
        { label: 'Card (Default) - With border and background', value: 'card' },
        { label: 'Clean Card - No border, clean background', value: 'cleanCard' },
        { label: 'Inline - Simple, stays within content width', value: 'inline' },
        { label: 'Full Width - Stretches edge to edge', value: 'fullwidth' },
        { label: 'Hero Style - Full width with overlay caption', value: 'hero' },
      ],
      admin: { description: 'Choose how this media block should be displayed on the page' },
    },
  ],
}
