import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig = {
  images: {
    remotePatterns: [
      // Production/Server URL patterns
      ...[NEXT_PUBLIC_SERVER_URL].filter(Boolean).map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
          pathname: '/api/media/file/**',
        }
      }),
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      // Supabase storage patterns
      ...[
        (() => {
          try {
            const u = process.env.NEXT_PUBLIC_SUPABASE_URL
              ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
              : process.env.S3_ENDPOINT
                ? new URL(process.env.S3_ENDPOINT)
                : undefined
            return u?.hostname
          } catch {
            return undefined
          }
        })(),
      ]
        .filter(Boolean)
        .map((hostname) => ({
          protocol: 'https',
          hostname,
          pathname: '/storage/v1/object/public/**',
        })),
      // Supabase API proxy used by Payload storage adapter (e.g., /api/media/file/**)
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/api/media/file/**',
      },
      // Fallback patterns
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
