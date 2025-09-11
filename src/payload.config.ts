import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, type PayloadRequest } from 'payload'
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

// Server URL configuration
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

  // SSL configuration
  let sslConfig: any = false

  if (isProduction || isSupabase) {
    // For production and Supabase, use secure SSL
    sslConfig = {
      rejectUnauthorized: true,
      // Handle Supabase SSL requirements
      ...(isSupabase && {
        ca: process.env.SUPABASE_CA_CERT || undefined,
      }),
    }

    // Override for specific SSL mode if set
    if (process.env.PGSSLMODE === 'no-verify') {
      console.log('[payload] SSL: PGSSLMODE=no-verify → rejectUnauthorized=false')
      sslConfig = { rejectUnauthorized: false }
    }
  }

  return {
    connectionString,
    ssl: sslConfig,
    // Optimized for serverless
    max: isVercel ? 1 : isProduction ? 5 : 10,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: isProduction ? 10000 : 5000,
    acquireTimeoutMillis: isProduction ? 60000 : 30000,
    // Disable keepalive for serverless
    keepAlive: !isVercel,
    keepAliveInitialDelayMillis: 0,
    // Application name for connection tracking
    application_name: `payload-cms-${process.env.VERCEL_ENV || 'local'}`,
  }
}

// S3/Supabase Storage configuration
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
              process.env.S3_ENDPOINT?.match(/([a-z]+)\.supabase/)?.[1]
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
        process.env.S3_FORCE_PATH_STYLE === 'true' || process.env.S3_ENDPOINT?.includes('supabase'),
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
    meta: {
      titleSuffix: '- Erin Jerri',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },

  editor: defaultLexical,

  db: postgresAdapter({
    pool: getDatabaseConfig(),
    // Enable schema push only in development
    push: isDevelopment,
    // Migration settings
    migrationDir: path.resolve(dirname, 'migrations'),
    // Disable auto-migrations in production
    disableCreateDatabase: isProduction,
  }),

  collections: [Pages, Posts, Media, Categories, Users],

  globals: [Header, Footer],

  // CORS configuration
  cors: [
    serverURL,
    ...(isDevelopment ? devOrigins : []),
    // Add your production domains here
    ...(isProduction ? ['https://your-domain.com', 'https://www.your-domain.com'] : []),
  ].filter(Boolean),

  // CSRF protection
  csrf: [
    serverURL,
    ...(isDevelopment ? devOrigins : []),
    ...(isProduction ? ['https://your-domain.com', 'https://www.your-domain.com'] : []),
  ].filter(Boolean),

  plugins: [
    ...plugins,
    // Only add S3 storage if configured
    ...(getStorageConfig() ? [getStorageConfig()] : []),
  ].filter(Boolean),

  secret: process.env.PAYLOAD_SECRET || '',

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Jobs configuration for scheduled tasks
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
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
    tasks: [
      // Add your scheduled tasks here
    ],
  },

  // Rate limiting for production
  rateLimit: isProduction
    ? {
        window: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
      }
    : undefined,

  // Graceful initialization with better error handling
  onInit: async (payload) => {
    const startTime = Date.now()

    try {
      // Environment diagnostics
      payload.logger.info(`[payload] Environment: ${process.env.NODE_ENV}`)
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
        payload.logger.warn(`[payload] Could not parse DATABASE_URL: ${e}`)
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

        // In production, this might be critical
        if (isProduction) {
          throw new Error(`Database connection failed: ${error}`)
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
