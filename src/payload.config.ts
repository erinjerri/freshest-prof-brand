import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = Boolean(process.env.VERCEL_ENV)
const isDevelopment = process.env.NODE_ENV === 'development'

// Server URL configuration - Fixed the undefined issue
const serverURL =
  getServerSideURL() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3000'

// Development origins for CORS
const devPorts = [3000, 3001, 3002, 3003, 3004, 3005]
const devOrigins = devPorts.flatMap((port) => [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
])

// Database configuration helper
const getDatabaseConfig = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // Parse URL to check if it's Supabase
  let isSupabase = false
  try {
    const url = new URL(connectionString)
    isSupabase = url.hostname.includes('supabase.com')
  } catch (e) {
    console.warn('Could not parse DATABASE_URL:', e)
  }

  // SSL configuration - Fixed to handle Supabase properly
  let sslConfig: boolean | object = false

  if (isProduction || isSupabase) {
    sslConfig = {
      rejectUnauthorized: true,
    }

    // Override for development or specific SSL mode
    if (process.env.PGSSLMODE === 'no-verify' || (!isProduction && isSupabase)) {
      console.log('[payload] SSL: Using no-verify mode for development/testing')
      sslConfig = { rejectUnauthorized: false }
    }
  }

  return {
    connectionString,
    ssl: sslConfig,
    // Optimized for serverless - Fixed connection limits
    max: isVercel ? 1 : isProduction ? 3 : 10,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    acquireTimeoutMillis: 60000,
    // Disable keepalive for serverless
    keepAlive: !isVercel,
    keepAliveInitialDelayMillis: 0,
    // Application name for connection tracking
    application_name: `payload-cms-${process.env.VERCEL_ENV || 'local'}`,
  }
}

// S3/Supabase Storage configuration - Fixed nullable return type
const getStorageConfig = () => {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) {
    return null
  }

  return s3Storage({
    collections: {
      [Media.slug]: {
        generateURL: ({ filename }) => {
          // For Supabase storage
          if (process.env.S3_ENDPOINT?.includes('supabase')) {
            const projectId =
              process.env.SUPABASE_PROJECT_ID ||
              process.env.S3_ENDPOINT?.match(/([a-zA-Z0-9]+)\.supabase/)?.[1]

            if (!projectId) {
              console.warn('Could not determine Supabase project ID')
              return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`
            }

            return `https://${projectId}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET}/${filename}`
          }

          // For other S3-compatible services
          const baseUrl =
            process.env.S3_PUBLIC_URL ||
            process.env.S3_ENDPOINT?.replace('/s3', '') ||
            `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION || 'us-west-1'}.amazonaws.com`
          return `${baseUrl}/${filename}`
        },
      },
    },
    bucket: process.env.S3_BUCKET,
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-west-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle:
        process.env.S3_FORCE_PATH_STYLE === 'true' ||
        Boolean(process.env.S3_ENDPOINT?.includes('supabase')),
    },
  })
}

export default buildConfig({
  serverURL,

  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    // Removed meta config - this was causing TypeScript errors
    // Meta should be handled in Next.js app/layout.tsx instead
  },

  editor: defaultLexical,

  db: postgresAdapter({
    pool: getDatabaseConfig(),
    // Enable schema push only in development
    push: isDevelopment,
    // Migration settings
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  collections: [Pages, Posts, Media, Categories, Users],

  globals: [Header, Footer],

  // CORS configuration - Fixed array filtering
  cors: [
    serverURL,
    ...(isDevelopment ? devOrigins : []),
    // Add your actual production domains here
    ...(isProduction ? [] : []), // Remove placeholder domains for now
  ].filter((url): url is string => Boolean(url)),

  // CSRF protection - Fixed array filtering
  csrf: [
    serverURL,
    ...(isDevelopment ? devOrigins : []),
    ...(isProduction ? [] : []), // Remove placeholder domains for now
  ].filter((url): url is string => Boolean(url)),

  // Fixed plugins array - removed potential null values
  plugins: [...plugins, getStorageConfig()].filter(Boolean),

  secret: process.env.PAYLOAD_SECRET || '',

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Jobs configuration - Simplified
  jobs: {
    access: {
      run: ({ req }) => {
        // Allow authenticated users
        if (req.user) return true

        // Allow cron jobs with secret
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET
        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
          return true
        }

        return false
      },
    },
    tasks: [],
  },

  // Rate limiting - Simplified condition
  ...(isProduction && {
    rateLimit: {
      window: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per window
      standardHeaders: true,
      legacyHeaders: false,
    },
  }),

  // Initialization with better error handling
  onInit: async (payload) => {
    const startTime = Date.now()

    try {
      // Environment diagnostics
      payload.logger.info(`[payload] Environment: ${process.env.NODE_ENV || 'unknown'}`)
      payload.logger.info(`[payload] Vercel Environment: ${process.env.VERCEL_ENV || 'local'}`)
      payload.logger.info(`[payload] Server URL: ${serverURL}`)

      // Database diagnostics
      const dbURL = process.env.DATABASE_URL || ''
      let dbHost = 'unknown'
      let dbSSLMode = 'unknown'

      try {
        const url = new URL(dbURL)
        dbHost = url.hostname
        dbSSLMode = url.searchParams.get('sslmode') || process.env.PGSSLMODE || 'default'
      } catch (e) {
        payload.logger.warn(`[payload] Could not parse DATABASE_URL`)
      }

      payload.logger.info(`[payload] Database Host: ${dbHost}`)
      payload.logger.info(`[payload] SSL Mode: ${dbSSLMode}`)

      // Test database connectivity
      try {
        const testQuery = await payload.find({
          collection: 'pages',
          limit: 1,
          depth: 0,
          overrideAccess: true,
          pagination: false,
        })

        const initTime = Date.now() - startTime
        payload.logger.info(`[payload] Database connectivity: OK (${initTime}ms)`)
        payload.logger.info(`[payload] Found ${testQuery.totalDocs} pages`)
      } catch (error) {
        payload.logger.error(`[payload] Database connectivity failed:`, error)

        // In production, this is critical
        if (isProduction) {
          throw new Error(`Database connection failed: ${String(error)}`)
        }
      }

      // Storage diagnostics
      if (process.env.S3_BUCKET) {
        payload.logger.info(`[payload] Storage: S3 configured (bucket: ${process.env.S3_BUCKET})`)
      } else {
        payload.logger.info(`[payload] Storage: Local filesystem`)
      }
    } catch (error) {
      payload.logger.error(`[payload] Initialization error:`, error)
      if (isProduction) {
        throw error
      }
    }
  },
})
