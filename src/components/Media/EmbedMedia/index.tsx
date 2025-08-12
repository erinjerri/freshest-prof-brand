'use client'

import React from 'react'
import { cn } from '@/utilities/ui'

function toEmbedUrl(input: string): string {
  try {
    const url = new URL(input)

    // YouTube
    if (/youtu\.be/i.test(url.hostname)) {
      const id = url.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    if (/youtube/i.test(url.hostname)) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      // already /embed/{id} or short
      if (url.pathname.startsWith('/embed/')) return url.toString()
    }

    // Vimeo
    if (/vimeo/i.test(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }

    return input
  } catch {
    return input
  }
}

export const EmbedMedia: React.FC<{ url: string; className?: string; title?: string }> = ({
  url,
  className,
  title,
}) => {
  const src = toEmbedUrl(url)

  return (
    <div className={cn('relative w-full', className)} style={{ paddingTop: '56.25%' }}>
      <iframe
        src={src}
        title={title || 'Embedded video'}
        className="absolute left-0 top-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
