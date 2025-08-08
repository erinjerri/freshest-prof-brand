import Link from 'next/link'
import React from 'react'
import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export function Footer({ data }: { data: Footer }) {
  const navItems = data?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
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
