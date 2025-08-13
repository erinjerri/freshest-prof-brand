import type { Block } from 'payload'
import {
  lexicalEditor,
  InlineToolbarFeature,
  FixedToolbarFeature,
  ItalicFeature,
  LinkFeature,
} from '@payloadcms/richtext-lexical'

export const Caption: Block = {
  slug: 'caption',
  interfaceName: 'CaptionBlock',
  labels: {
    singular: 'Caption',
    plural: 'Captions',
  },
  fields: [
    {
      name: 'text',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ItalicFeature(),
          LinkFeature({ enabledCollections: ['pages', 'posts'] }),
        ],
      }),
      admin: {
        description: 'Small, muted, centered text commonly used as an image caption.',
      },
    },
  ],
}
