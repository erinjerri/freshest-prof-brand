'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  const [theme, setTheme] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Reset theme on route change
  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  // Mark component as mounted to avoid SSR mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sync theme from context
  useEffect(() => {
    if (headerTheme && headerTheme !== theme) {
      setTheme(headerTheme)
    }
  }, [headerTheme])

  // Only apply data-theme after hydration
  const headerProps = isMounted && theme ? { 'data-theme': theme } : {}

  return (
    <header className="container relative z-20" {...headerProps}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
