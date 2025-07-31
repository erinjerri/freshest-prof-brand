import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

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
    // Image optimization settings to prevent timeouts
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable optimization for development to avoid timeouts
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Removed experimental options that were causing errors
  // Optimize webpack for faster builds and better performance
  webpack: (webpackConfig, { dev, isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Optimize for development
    if (dev) {
      webpackConfig.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    // Optimize bundle size
    if (!dev && !isServer) {
      webpackConfig.optimization.splitChunks.cacheGroups.default = {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      }
    }

    return webpackConfig
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  redirects,
}

// This is the correct ES Module export for Next.js config files
export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
