'use client'

import React, { Fragment, useEffect, useState } from 'react'
import type { Page } from '@/payload-types'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  // SSR-safe page context
  const [isHomePage, setIsHomePage] = useState(false)
  const [isPostCard, setIsPostCard] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHomePage(window.location.pathname === '/')
      setIsPostCard(window.location.pathname.includes('/posts'))
    }
  }, [])

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Special handling for MediaBlock with layout options
              if (blockType === 'mediaBlock') {
                const mediaBlock = block as any
                const layout = mediaBlock.layout || 'card'
                // MediaBlock handles both upload and embed logic internally,
                // passing embedUrl and sourceType as props.
                return (
                  <div className="my-16" key={index}>
                    <MediaBlock
                      {...mediaBlock}
                      layout={layout}
                      enableGutter={layout !== 'hero' && layout !== 'fullwidth'}
                      disableInnerContainer={layout === 'hero' || layout === 'fullwidth'}
                      isHomePage={isHomePage}
                      isPostCard={isPostCard}
                    />
                  </div>
                )
              }

              // All other block types (not MediaBlock)
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }

          return null
        })}
      </Fragment>
    )
  }

  return null
}
