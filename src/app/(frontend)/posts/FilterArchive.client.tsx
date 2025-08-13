'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { CardPostData } from '@/custom-payload-types'
import type { Category } from '@/payload-types'
import { Card } from '@/components/Card'
import { cn } from '@/utilities/ui'

type SimpleCategory = Pick<Category, 'id' | 'slug' | 'title'>

type Props = {
  posts: CardPostData[]
  categories: SimpleCategory[]
}

export default function FilterArchive({ posts, categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initial = (searchParams.get('tag') || 'all').toLowerCase()
  const [activeTag, setActiveTag] = useState<string>(initial)

  useEffect(() => {
    const tag = searchParams.get('tag')
    setActiveTag((tag || 'all').toLowerCase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const onSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') params.delete('tag')
    else params.set('tag', slug)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    setActiveTag(slug)
  }

  const filtered = useMemo(() => {
    if (activeTag === 'all') return posts
    return posts.filter((p) => {
      if (!p.categories || p.categories.length === 0) return false
      return p.categories.some((c) => {
        if (typeof c === 'number') return false
        return (c.slug || '').toLowerCase() === activeTag
      })
    })
  }, [activeTag, posts])

  return (
    <div className="container">
      {/* Filter bar */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <FilterPill active={activeTag === 'all'} onClick={() => onSelect('all')}>
            All
          </FilterPill>
          {categories.map((cat) => (
            <FilterPill
              key={cat.id}
              active={activeTag === (cat.slug || '').toLowerCase()}
              onClick={() => onSelect((cat.slug || '').toLowerCase())}
            >
              {cat.title}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Archive grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <Card
            key={post.id}
            doc={post}
            relationTo="posts"
            showCategories
            className="h-full hover:border-[#1C8FDA] transition-colors"
          />
        ))}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors',
        active
          ? 'bg-[#1C8FDA] border-[#1C8FDA] text-white'
          : 'bg-transparent border-white/30 text-white hover:bg-white/10',
      )}
    >
      {children}
    </button>
  )
}
