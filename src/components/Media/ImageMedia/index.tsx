'use client'

import React from 'react'
import Image from 'next/image'

import type { Props as MediaProps } from '../types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const { className, pictureClassName, resource, src, alt: altFromProps, fill, loading, priority } = props

  // 1) If a static `src` was provided (e.g., imported image), prefer that
  if (src) {
    const alt = altFromProps || ''
    return (
      <Image
        alt={alt}
        className={cn(className)}
        src={src}
        // Static imports include width/height; respect optional overrides
        loading={loading}
        priority={priority}
      />
    )
  }

  // 2) If a Payload `resource` was provided, derive the URL
  if (resource && typeof resource === 'object') {
    const alt = altFromProps ?? resource.alt ?? ''
    const candidateUrl = resource.url || (resource.filename ? `/media/${resource.filename}` : undefined)
    const resolvedUrl = candidateUrl ? getMediaUrl(candidateUrl) : ''

    // Do not render an image with an empty src; return null instead
    if (!resolvedUrl) return null

    // Use width/height from the resource when available for better layout stability
    const width = resource.width ?? undefined
    const height = resource.height ?? undefined

    // When both width and height are known, render a fixed-size image.
    // Otherwise fall back to fill layout.
    const shouldFill = fill || !width || !height

    return (
      <picture className={cn(pictureClassName)}>
        <Image
          alt={alt}
          className={cn(className)}
          src={resolvedUrl}
          {...(shouldFill
            ? { fill: true }
            : { width, height })}
          loading={loading}
          priority={priority}
          sizes={shouldFill ? '(max-width: 768px) 100vw, 768px' : undefined}
        />
      </picture>
    )
  }

  // 3) Nothing to render
  return null
}

export default ImageMedia


