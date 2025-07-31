// src/components/Media/index.tsx
import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  // Destructure imgClassName and videoClassName from props here
  const { className, htmlElement = 'div', resource, imgClassName, videoClassName } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? (
        // Pass videoClassName to VideoMedia
        <VideoMedia {...props} className={videoClassName} />
      ) : (
        // Pass imgClassName to ImageMedia
        <ImageMedia {...props} className={imgClassName} />
      )}
    </Tag>
  )
}
