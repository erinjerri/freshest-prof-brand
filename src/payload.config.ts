import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import fs from 'fs'

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

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = Boolean(process.env.VERCEL_ENV)
const isDevelopment = process.env.NODE_ENV === 'development'

const serverURL =
  getServerSideURL() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3000'

const devPorts = [3000, 3001, 3002, 3003, 3004, 3005]
const devOrigins = devPorts.flatMap((port) => [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
])

const getDatabaseConfig = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  let isSupabase = false
  let dbHostname: string | undefined
  let urlSSLMode: string | undefined
  try {
    const url = new URL(connectionString)
    dbHostname = url.hostname
    urlSSLMode = url.searchParams.get('sslmode') || undefined
    isSupabase = url.hostname.includes('supabase.co')
  } catch (e) {
    console.warn('Could not parse DATABASE_URL:', e)
  }

  // Helpers to load PEM material from env/base64/path
  const readIfExists = (p?: string) => {
    try {
      return p && fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined
    } catch {
      return undefined
    }
  }

  const fromBase64 = (v?: string) => {
    try {
      return v ? Buffer.from(v, 'base64').toString('utf8') : undefined
    } catch {
      return undefined
    }
  }

  // Multiple ways to provide certificates - environment variables with different formats
  const caPEM =
    process.env.SUPABASE_SSL_ROOT_CERT ||
    process.env.PG_CA_CERT ||
    fromBase64(process.env.PG_CA_CERT_BASE64) ||
    readIfExists(process.env.PG_CA_CERT_PATH) ||
    readIfExists(process.env.PGSSLROOTCERT)

  const certPEM =
    process.env.SUPABASE_SSL_CERT ||
    process.env.PG_SSL_CERT ||
    fromBase64(process.env.PG_SSL_CERT_BASE64) ||
    readIfExists(process.env.PG_SSL_CERT_PATH) ||
    readIfExists(process.env.PGSSLCERT)

  const keyPEM =
    process.env.SUPABASE_SSL_KEY ||
    process.env.PG_SSL_KEY ||
    fromBase64(process.env.PG_SSL_KEY_BASE64) ||
    readIfExists(process.env.PG_SSL_KEY_PATH) ||
    readIfExists(process.env.PGSSLKEY)

  // Decide SSL behavior
  const envSSLMode = process.env.PGSSLMODE // e.g. 'require' | 'verify-ca' | 'verify-full' | 'no-verify' | 'disable'
  const effectiveSSLMode =
    envSSLMode || urlSSLMode || (isProduction || isSupabase ? 'require' : undefined)

  let sslConfig:
    | false
    | {
        rejectUnauthorized?: boolean
        ca?: string
        cert?: string
        key?: string
        servername?: string
      }

  if (effectiveSSLMode === 'disable') {
    sslConfig = false
  } else {
    const shouldVerify =
      effectiveSSLMode === 'verify-ca' ||
      effectiveSSLMode === 'verify-full' ||
      effectiveSSLMode === 'require'

    sslConfig = {
      rejectUnauthorized: shouldVerify,
      ca: caPEM || undefined,
      cert: certPEM || undefined,
      key: keyPEM || undefined,
      servername: dbHostname || undefined,
    }

    // When explicitly opting out of verification
    if (effectiveSSLMode === 'no-verify') {
      sslConfig.rejectUnauthorized = false
    }

    // If we have proper certificates, we can verify
    if (caPEM || certPEM) {
      sslConfig.rejectUnauthorized = true
    } else if (!envSSLMode && (isProduction || isSupabase)) {
      // Back-compat: if we're in prod/Supabase with no cert provided and no explicit mode,
      // maintain previous permissive behavior to avoid breaking local setups
      sslConfig.rejectUnauthorized = false
    }
  }

  sslConfig = {
    rejectUnauthorized: true,
    ca: process.env.PG_SSL_CERT,
  }

  return {
    connectionString,
    ssl: sslConfig,
    max: isVercel ? 1 : isProduction ? 3 : 10,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    acquireTimeoutMillis: 60000,
    keepAlive: !isVercel,
    keepAliveInitialDelayMillis: 0,
    application_name: `payload-cms-${process.env.VERCEL_ENV || 'local'}`,
  }
}

const getStorageConfig = () => {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) {
    return null
  }

  return s3Storage({
    collections: {
      [Media.slug]: {
        generateURL: ({ filename }) => {
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
  },

  editor: defaultLexical,

  db: postgresAdapter({
    pool: getDatabaseConfig(),
    push: isDevelopment,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  collections: [Pages, Posts, Media, Categories, Users],

  globals: [Header, Footer],

  cors: [serverURL, ...(isDevelopment ? devOrigins : [])].filter((url): url is string =>
    Boolean(url),
  ),

  csrf: [serverURL, ...(isDevelopment ? devOrigins : [])].filter((url): url is string =>
    Boolean(url),
  ),

  plugins: [...plugins, getStorageConfig()].filter(Boolean),

  secret: process.env.PAYLOAD_SECRET || '',

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  jobs: {
    access: {
      run: ({ req }) => {
        if (req.user) return true

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

  ...(isProduction && {
    rateLimit: {
      window: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    },
  }),

  onInit: async (payload) => {
    const startTime = Date.now()

    try {
      payload.logger.info(`[payload] Environment: ${process.env.NODE_ENV || 'unknown'}`)
      payload.logger.info(`[payload] Vercel Environment: ${process.env.VERCEL_ENV || 'local'}`)
      payload.logger.info(`[payload] Server URL: ${serverURL}`)

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

      // Log SSL certificate status
      const hasCACert = Boolean(process.env.SUPABASE_SSL_ROOT_CERT || process.env.PG_CA_CERT)
      const hasClientCert = Boolean(process.env.SUPABASE_SSL_CERT || process.env.PG_SSL_CERT)
      payload.logger.info(
        `[payload] SSL CA Certificate: ${hasCACert ? 'Provided' : 'Not provided'}`,
      )
      payload.logger.info(
        `[payload] SSL Client Certificate: ${hasClientCert ? 'Provided' : 'Not provided'}`,
      )

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
        if (isProduction) {
          throw new Error(`Database connection failed: ${String(error)}`)
        }
      }

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
