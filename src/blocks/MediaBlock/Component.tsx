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
        resource={resource || undefined}
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

      {resource && resource.caption ? (
        <figcaption className={cn('mt-3 text-sm text-muted-foreground', captionClassName)}>
          <RichText data={resource.caption} enableGutter={false} />
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
