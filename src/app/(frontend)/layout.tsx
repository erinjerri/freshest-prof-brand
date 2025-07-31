import type { Metadata } from 'next';
import { cn } from '@/utilities/ui';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';
import { AdminBar } from '@/components/AdminBar';
import { FooterClient } from '@/Footer/Component.client'; // Ensure this file exists
import { HeaderClient } from '@/Header/Component.client';
import { Providers } from '@/providers';
import { InitTheme } from '@/providers/Theme/InitTheme';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import { draftMode } from 'next/headers';
import { getCachedGlobal } from '@/utilities/getGlobals';
import type { Header, Footer } from '@/payload-types';
import './globals.css';
import { getServerSideURL } from '@/utilities/getURL';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode();
  
  const headerData: Header = await getCachedGlobal('header', 1)();
  const footerData: Footer = await getCachedGlobal('footer', 1)();

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <Suspense fallback={<div className="bg-muted text-muted-foreground p-4 text-center">Loading Header...</div>}>
            <HeaderClient data={headerData} />
          </Suspense>
          {children}
          <Suspense fallback={<div className="bg-muted text-muted-foreground p-4 text-center">Loading Footer...</div>}>
            <FooterClient data={footerData} />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
};