// src/components/Card/index.tsx
'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

// Aliased Media to MediaType to avoid conflict with component
import type { Category, Media as MediaType } from '@/payload-types'

import type { CardPostData } from '@/custom-payload-types' // Correct: Import from your custom types file

import { Media as MediaComponent } from '@/components/Media' // Assuming this is your component import

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  // Ensure doc is not null/undefined before destructuring
  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {} // meta can be null, so meta.image needs to be accessed defensively

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200',
        'flex flex-col', // Ensure flex column for vertical layout
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-video bg-gray-50/50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden">
        {/* Conditional rendering for metaImage based on its type */}
        {metaImage ? (
          typeof metaImage === 'string' ? (
            // If metaImage is a string (URL)
            <img
              src={metaImage}
              alt={titleToUse || 'Post image'}
              className="w-full h-full object-cover"
            />
          ) : (
            // If metaImage is a Media object (from Payload relation)
            // Ensure MediaComponent can handle the Media type from payload-types.ts
            <MediaComponent
              resource={metaImage as MediaType}
              imgClassName="w-full h-full object-cover"
            />
          )
        ) : (
          // Placeholder if no image exists
          <div className="text-gray-400 dark:text-gray-500 text-sm">No Image</div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {' '}
        {/* flex-grow to push content down */}
        {showCategories && hasCategories && (
          <div className="uppercase text-xs text-gray-500 dark:text-gray-400 mb-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && 'title' in category) {
                const { title: titleFromCategory } = category
                const categoryTitle = titleFromCategory || 'Untitled category'
                const isLast = index === categories.length - 1
                return (
                  <Fragment key={category.id || index}>
                    {' '}
                    {/* Use category.id for key if available */}
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }
              return null // Handle cases where category might be a number (ID) if not populated
            })}
          </div>
        )}
        {titleToUse && (
          <div className="prose dark:prose-invert mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              <Link className="not-prose hover:underline" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {sanitizedDescription && (
          <div className="mt-auto text-sm text-gray-600 dark:text-gray-300">
            {' '}
            {/* mt-auto pushes description to bottom */}
            <p className="line-clamp-3">{sanitizedDescription}</p>{' '}
            {/* line-clamp for truncated description */}
          </div>
        )}
      </div>
    </article>
  )
}
