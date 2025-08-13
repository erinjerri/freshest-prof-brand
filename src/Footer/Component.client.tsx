'use client'

import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { Facebook, Github, Mail, Newspaper } from 'lucide-react'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const navItems = data?.navItems || []
  const { theme } = useTheme()

  const [isMounted, setIsMounted] = useState(false)
  const [email, setEmail] = useState('')

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

        {/* Subscribe form */}
        <form
          className="w-full max-w-3xl flex items-stretch gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = 'https://erinjerri.substack.com'
          }}
        >
          <input
            type="email"
            inputMode="email"
            placeholder="Enter your email"
            aria-label="Email address"
            className="flex-1 bg-transparent border border-white/40 text-white placeholder:text-white/60 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FDA]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded bg-[#C7D8F5] text-black font-medium hover:bg-[#b9c9ea] transition-colors"
          >
            Subscribe
          </button>
        </form>

        {/* Social icons */}
        <div className="flex items-center gap-8">
          <a
            href="https://bit.ly/ErinJerriFBFanP"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white hover:text-[#1C8FDA] transition-colors"
          >
            <Facebook size={28} strokeWidth={2.2} />
          </a>
          <a
            href="https://github.com/erinjerri"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-white hover:text-[#1C8FDA] transition-colors"
          >
            <Github size={28} strokeWidth={2.2} />
          </a>
          <a
            href="mailto:erin@erinjerri.xyz."
            aria-label="Email"
            className="text-white hover:text-[#1C8FDA] transition-colors"
          >
            <Mail size={28} strokeWidth={2.2} />
          </a>
          <a
            href="https://erinjerri.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Substack"
            className="text-white hover:text-[#1C8FDA] transition-colors"
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
