import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Existing remote patterns for your server URL
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Rule for local Payload-served images (e.g., http://localhost:3000/api/media/file/...)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Ensure this matches your local Next.js/Payload dev server port
        pathname: '/api/media/file/**', // This is Payload's default media API path
      },
      // Rule for Supabase Storage images (e.g., https://svymelrynakuwzkytsvs.supabase.co/storage/v1/object/public/...)
      {
        protocol: 'https',
        hostname: 'svymelrynakuwzkytsvs.supabase.co', // YOUR EXACT SUPABASE STORAGE HOSTNAME
        port: '', // No specific port for HTTPS
        pathname: '/storage/v1/object/public/**', // Supabase Storage public path
      },
      // Add other remote patterns here if you have images from other domains
    ],
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

// This is the correct ES Module export for Next.js config files
export default withPayload(nextConfig, { devBundleServerPackages: false })
