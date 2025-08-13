import Link from 'next/link'
import React from 'react'
import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { Facebook, Github, Mail, Newspaper } from 'lucide-react'

export function Footer({ data }: { data: Footer }) {
  const navItems = data?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-10 flex flex-col items-center gap-8">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        {/* Subscribe form (non-interactive fallback to Substack) */}
        <div className="w-full max-w-3xl flex items-stretch gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            className="flex-1 bg-transparent border border-white/40 text-white placeholder:text-white/60 rounded px-4 py-3"
          />
          <a
            className="px-6 py-3 rounded bg-[#C7D8F5] text-black font-medium hover:bg-[#b9c9ea] transition-colors"
            href="https://erinjerri.substack.com"
          >
            Subscribe
          </a>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-8">
          <a
            href="https://facebook.com/erinjerri"
            className="text-white hover:text-[#1C8FDA] transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={28} strokeWidth={2.2} />
          </a>
          <a
            href="https://github.com/erinjerri"
            className="text-white hover:text-[#1C8FDA] transition-colors"
            aria-label="GitHub"
          >
            <Github size={28} strokeWidth={2.2} />
          </a>
          <a
            href="mailto:hello@erinjerri.com"
            className="text-white hover:text-[#1C8FDA] transition-colors"
            aria-label="Email"
          >
            <Mail size={28} strokeWidth={2.2} />
          </a>
          <a
            href="https://erinjerri.substack.com"
            className="text-white hover:text-[#1C8FDA] transition-colors"
            aria-label="Substack"
          >
            <Newspaper size={28} strokeWidth={2.2} />
          </a>
        </div>

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
