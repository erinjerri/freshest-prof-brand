// src/components/Card/index.tsx
'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

// REMOVE this line: import type { Post } from '@/payload-types'
// Keep Category and Media if they are used as types in this file
import type { Category, Media } from '@/payload-types'

import type { CardPostData } from '@/custom-payload-types' // Correct: Import from your custom types file

import { Media as MediaComponent } from '@/components/Media' // Assuming this is your component import

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData // Now correctly typed
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  // Ensure doc is not null/undefined before destructuring
  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {/* Ensure metaImage is correctly handled. If it's a Media object, you might need metaImage.url */}
        {metaImage && typeof metaImage !== 'string' && 'url' in metaImage && (
          <MediaComponent resource={metaImage} size="33vw" />
        )}
        {/* If metaImage can be a string (URL) directly, you'd handle that too */}
        {metaImage && typeof metaImage === 'string' && (
          <img src={metaImage} alt={titleToUse || ''} className="w-full h-auto object-cover" />
        )}
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {/* Ensure category is treated as a Category object here for its title */}
                {categories?.map((category, index) => {
                  if (typeof category === 'object' && 'title' in category) {
                    // Check if it's an object and has 'title'
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }
                  return null // Handle cases where category might be a number (ID) if not populated
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
