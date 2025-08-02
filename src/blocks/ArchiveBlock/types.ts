import type { Post } from '@/payload-types'

export type ArchiveBlockProps = {
  blockType: string
  blockName?: string
  // Add other props that your ArchiveBlock expects
}

export type MediaBlockProps = {
  media: { url: string; alt?: string } | string
  layout?: 'card' | 'cleanCard' | 'hero' | 'fullwidth' | 'inline'
  enableGutter?: boolean
  disableInnerContainer?: boolean
  isHomePage?: boolean
  isPostCard?: boolean
}
