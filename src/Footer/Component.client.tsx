'use client';
import { useTheme } from '@/providers/Theme'; // Adjust import based on your theme provider
import Link from 'next/link';
import React from 'react';

import type { Footer } from '@/payload-types';

import { ThemeSelector } from '@/providers/Theme/ThemeSelector';
import { CMSLink } from '@/components/Link';
import { Logo } from '@/components/Logo/Logo';

interface FooterClientProps {
  data: Footer;
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const navItems = data?.navItems || [];
  const { theme } = useTheme(); // Access theme for potential styling or ThemeSelector

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white" data-theme={theme || undefined}>
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => (
              <CMSLink className="text-white" key={i} {...link} />
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};