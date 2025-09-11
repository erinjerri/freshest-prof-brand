import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Suspense } from 'react'
import { AdminBar } from '@/components/AdminBar'
import { FooterClient } from '@/Footer/Component.client' // Ensure this file exists
import { HeaderClient } from '@/Header/Component.client'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header, Footer } from '@/payload-types'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const headerData: Header = await getCachedGlobal('header', 1)()
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <Suspense
            fallback={
              <div className="bg-muted text-muted-foreground p-4 text-center">
                Loading Header...
              </div>
            }
          >
            <HeaderClient data={headerData} />
          </Suspense>
          <main>{children}</main>
          <Suspense
            fallback={
              <div className="bg-muted text-muted-foreground p-4 text-center">
                Loading Footer...
              </div>
            }
          >
            <FooterClient data={footerData} />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: {
    template: '%s | Erin Jerri - Professional Brand',
    default: 'Erin Jerri - Professional Brand Portfolio',
  },
  description:
    'Professional brand portfolio website showcasing expertise in technology, design, and innovation. Discover my journey, projects, and professional achievements.',
  keywords: [
    'Erin Jerri',
    'Professional Brand',
    'Portfolio',
    'Technology',
    'Design',
    'Innovation',
    'Web Development',
    'Professional Services',
  ],
  authors: [{ name: 'Erin Jerri' }],
  creator: 'Erin Jerri',
  publisher: 'Erin Jerri',
  metadataBase: new URL(getServerSideURL()),
  alternates: {
    canonical: getServerSideURL(),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getServerSideURL(),
    siteName: 'Erin Jerri - Professional Brand',
    title: 'Erin Jerri - Professional Brand Portfolio',
    description:
      'Professional brand portfolio website showcasing expertise in technology, design, and innovation.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Erin Jerri - Professional Brand Portfolio',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Erin Jerri - Professional Brand',
        type: 'image/jpeg',
      },
    ],
    ...mergeOpenGraph(), // This will merge any additional OpenGraph data from your utility
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Erin Jerri - Professional Brand Portfolio',
    description:
      'Professional brand portfolio website showcasing expertise in technology, design, and innovation.',
    creator: '@erinjerri', // Update with your actual Twitter handle
    site: '@erinjerri', // Update with your actual Twitter handle
    images: [
      {
        url: '/twitter-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Erin Jerri - Professional Brand Portfolio',
      },
    ],
  },
  verification: {
    // Add your verification IDs when you have them
    // google: 'your-google-verification-id',
    // other: {
    //   'facebook-domain-verification': 'your-facebook-verification-id',
    // },
  },
  category: 'technology',
}
