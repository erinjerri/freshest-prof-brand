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
  const [scrollProgress, setScrollProgress] = useState(0)

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
  }, [headerTheme, theme])

  // Top scroll progress bar
  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const max = Math.max(scrollHeight - clientHeight, 1)
      const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100))
      setScrollProgress(pct)
    }
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update()
          ticking = false
        })
        ticking = true
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Only apply data-theme after hydration
  const headerProps = isMounted && theme ? { 'data-theme': theme } : {}

  return (
    <header className="container relative z-20" {...headerProps}>
      {/* Top scroll progress bar */}
      <div className="fixed left-0 top-0 z-30 h-1 w-full bg-transparent">
        <div
          className="h-full"
          style={{ width: `${scrollProgress}%`, backgroundColor: '#1C8FDA' }}
        />
      </div>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
