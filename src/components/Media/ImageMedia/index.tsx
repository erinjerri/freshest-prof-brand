'use client'

import React from 'react'
import Image from 'next/image'

import type { Props as MediaProps } from '../types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    className,
    pictureClassName,
    resource,
    src,
    alt: altFromProps,
    fill,
    loading,
    priority,
  } = props

  // 1) If a static `src` was provided (e.g., imported image), prefer that
  if (src) {
    const alt = altFromProps || ''
    return (
      <Image alt={alt} className={cn(className)} src={src} loading={loading} priority={priority} />
    )
  }

  // 2) If a Payload `resource` was provided, derive the URL
  if (resource && typeof resource === 'object') {
    const alt = altFromProps ?? resource.alt ?? ''
    const candidateUrl =
      resource.url || (resource.filename ? `/api/media/file/${resource.filename}` : undefined)
    const resolvedUrl = candidateUrl ? getMediaUrl(candidateUrl) : ''

    // Do not render an image with an empty src; return null instead
    if (!resolvedUrl) return null

    // Detect external URLs and GIFs — render with native <img> so Next/Image doesn't block them
    const isGif =
      (resource?.mimeType && resource.mimeType.includes('gif')) ||
      resolvedUrl.toLowerCase().endsWith('.gif')
    const isExternal = resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')

    // Use width/height from the resource when available for better layout stability
    const width = resource.width ?? undefined
    const height = resource.height ?? undefined
    const hasDims = Boolean(width && height)

    // Fallback to native <img> for external URLs, GIFs, or when dimensions are missing to avoid 0px height issues
    if (isGif || isExternal || !hasDims) {
      return (
        <picture className={cn(pictureClassName)}>
          <img src={resolvedUrl} alt={alt} className={cn(className)} loading={loading as any} />
        </picture>
      )
    }

    // When dimensions are known, prefer fixed-size; allow fill if explicitly requested
    const useFill = Boolean(fill)

    return (
      <picture className={cn(pictureClassName)}>
        <Image
          alt={alt}
          className={cn(className)}
          src={resolvedUrl}
          {...(useFill ? { fill: true } : { width, height })}
          loading={loading}
          priority={priority}
          sizes={useFill ? '(max-width: 768px) 100vw, 1200px' : undefined}
        />
      </picture>
    )
  }

  // 3) Nothing to render
  return null
}

export default ImageMedia
