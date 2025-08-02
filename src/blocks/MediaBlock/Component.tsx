'use client'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import React from 'react'
import { Media } from '@/components/Media'

export const MediaBlock: React.FC<
  MediaBlockProps & {
    layout?: 'card' | 'hero' | 'fullwidth'
    enableGutter?: boolean
    disableInnerContainer?: boolean
    isHomePage?: boolean
    isPostCard?: boolean
  }
> = ({
  layout = 'card',
  enableGutter = layout !== 'hero' && layout !== 'fullwidth',
  disableInnerContainer = layout === 'hero' || layout === 'fullwidth',
  isHomePage = false,
  isPostCard = false,
  ...props
}) => {
  return (
    <div className="container">
      <Media
        {...props}
        layout={layout}
        enableGutter={enableGutter}
        disableInnerContainer={disableInnerContainer}
        isHomePage={isHomePage}
        isPostCard={isPostCard}
      />
    </div>
  )
}
