'use client'

import React from 'react'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export type CaptionBlockProps = {
  text: any
  className?: string
}

export const CaptionBlock: React.FC<CaptionBlockProps> = ({ text, className }) => {
  if (!text) return null
  return (
    <div className={cn('my-3 text-center text-sm text-muted-foreground', className)}>
      <RichText data={text} enableGutter={false} enableProse={false} />
    </div>
  )
}

export default CaptionBlock
