'use client'

import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const navItems = data?.navItems || []
  const { theme } = useTheme()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const footerProps = isMounted && theme ? { 'data-theme': theme } : {}

  return (
    <footer
      className="mt-auto border-t border-border bg-black dark:bg-card text-white"
      {...footerProps}
    >
      <div className="container py-10 flex flex-col items-center gap-8">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {navItems.map(({ link }, i) => (
            <CMSLink
              className="text-white hover:text-[#1C8FDA] transition-colors"
              key={i}
              {...link}
            />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
