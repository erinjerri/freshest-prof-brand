'use client'

import React from 'react'

import type { MediaBlock as MediaBlockProps, Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

type ExtraUIProps = {
  className?: string
  imgClassName?: string
  videoClassName?: string
  captionClassName?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
  isHomePage?: boolean
  isPostCard?: boolean
}

export const MediaBlock: React.FC<MediaBlockProps & ExtraUIProps> = (props) => {
  const {
    media,
    layout = 'card',
    className,
    imgClassName,
    videoClassName,
    captionClassName,
    enableGutter = true,
    disableInnerContainer = false,
  } = props

  const sourceType = (props as any)?.sourceType ?? 'upload'
  const embedUrl: string | undefined = (props as any)?.embedUrl

  const resource: MediaType | null =
    media && typeof media === 'object' ? (media as MediaType) : null

  // Choose outer styling by layout
  const outerClasses = cn(
    {
      'bg-muted/40 border rounded-xl': layout === 'card',
      '': layout === 'cleanCard' || layout === 'inline',
      'w-full': layout === 'fullwidth' || layout === 'hero',
    },
    className,
  )

  const innerContent = (
    <figure className={cn('relative', layout === 'hero' ? 'aspect-[16/9]' : undefined)}>
      <Media
        resource={sourceType === 'upload' ? resource || undefined : undefined}
        embedUrl={sourceType === 'embed' ? embedUrl : undefined}
        imgClassName={cn(
          imgClassName,
          layout === 'card' && 'rounded-lg',
          layout === 'inline' && 'mx-auto',
          layout === 'fullwidth' && 'w-full h-auto',
          layout === 'hero' && 'object-cover',
        )}
        videoClassName={cn(
          videoClassName,
          layout === 'fullwidth' && 'w-full h-auto',
          layout === 'hero' && 'w-full h-full object-cover',
        )}
        // When we don't know exact intrinsic size, allow fill for hero
        fill={layout === 'hero'}
        priority={layout === 'hero'}
      />

      {/* Captions: prefer custom block caption when enabled; fall back to media resource caption */}
      {((props as any)?.showCaption && (props as any)?.caption) ||
      (sourceType === 'upload' && resource && resource.caption) ? (
        <figcaption
          className={cn('mt-3 text-sm text-muted-foreground text-center', captionClassName)}
        >
          {(props as any)?.showCaption && (props as any)?.caption ? (
            <RichText data={(props as any).caption} enableGutter={false} enableProse={false} />
          ) : (
            <RichText data={resource!.caption as any} enableGutter={false} enableProse={false} />
          )}
        </figcaption>
      ) : null}
    </figure>
  )

  // Optionally wrap with container/gutter
  return (
    <div className={outerClasses}>
      {disableInnerContainer ? (
        innerContent
      ) : (
        <div className={cn({ container: enableGutter })}>{innerContent}</div>
      )}
    </div>
  )
}

export default MediaBlock
