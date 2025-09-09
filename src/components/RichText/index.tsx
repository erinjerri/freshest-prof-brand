'use client'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import { LinkJSXConverter, RichText as ConvertRichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { CodeBlock } from '@/blocks/Code/Component'
import type { CodeBlockProps } from '@/blocks/Code/Component'
import { CaptionBlock } from '@/blocks/Caption/Component'
import type { CaptionBlockProps } from '@/blocks/Caption/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | CaptionBlockProps
    >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  paragraph: ({ node, nodesToJSX }) => (
    <div className="my-6 leading-7">{nodesToJSX({ nodes: (node as any)?.children || [] })}</div>
  ),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => {
      const layout = (node.fields as any)?.layout
      const wrapperClass = layout === 'inline' ? 'col-start-2' : 'col-start-1 col-span-3'
      const imgClass = layout === 'inline' ? 'mx-auto' : 'm-0'
      return (
        <MediaBlock
          className={wrapperClass}
          imgClassName={imgClass}
          {...node.fields}
          captionClassName="mx-auto max-w-[48rem] text-center"
          enableGutter={false}
          disableInnerContainer
        />
      )
    },
    caption: ({ node }) => <CaptionBlock className="col-start-2" {...(node.fields as any)} />,
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert prose-p:my-6 prose-p:leading-7': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
