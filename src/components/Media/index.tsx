// src/components/Media/index.tsx
import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { EmbedMedia } from './EmbedMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource, imgClassName, videoClassName, embedUrl } = props

  if (embedUrl) {
    const Tag = htmlElement || Fragment
    return (
      <Tag {...(htmlElement !== null ? { className } : {})}>
        <EmbedMedia url={embedUrl} className={videoClassName || className} />
      </Tag>
    )
  }

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag {...(htmlElement !== null ? { className } : {})}>
      {isVideo ? (
        <VideoMedia {...props} className={videoClassName} />
      ) : (
        <ImageMedia {...props} className={imgClassName} />
      )}
    </Tag>
  )
}
