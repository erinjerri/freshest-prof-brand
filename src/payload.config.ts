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

// As a last-resort workaround for self-signed DB certs in serverless
// environments (e.g., Vercel), force Node to accept unauthorized certs.
// This applies process-wide and should be replaced with a proper CA when possible.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL =
  getServerSideURL() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.VERCEL_URL ||
  'http://localhost:3000'

// Allow common dev origins and ports to prevent CORS/CSRF issues when Next picks a different port
const devPorts = [3000, 3001, 3002, 3003, 3004, 3005]
const devOrigins = devPorts.flatMap((port) => [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  `http://0.0.0.0:${port}`,
  `http://[::1]:${port}`,
])

// 🔐 Environment-aware SSL resolution
const resolvedSSL = (() => {
  const mode = (process.env.PGSSLMODE || '').toLowerCase()
  if (mode === 'no-verify') {
    console.log('[payload] SSL: PGSSLMODE=no-verify → rejectUnauthorized=false')
    return { rejectUnauthorized: false }
  }

  try {
    const q = (process.env.DATABASE_URL || '').split('?')[1]
    const m = q ? new URLSearchParams(q).get('sslmode')?.toLowerCase() : undefined
    if (m === 'no-verify') {
      console.log('[payload] SSL: sslmode=no-verify in DATABASE_URL → rejectUnauthorized=false')
      return { rejectUnauthorized: false }
    }
  } catch {}

  if (process.env.PGSSL_CA) {
    console.log('[payload] SSL: PGSSL_CA provided → using CA cert')
    return { ca: process.env.PGSSL_CA, rejectUnauthorized: true }
  }

  console.log('[payload] SSL: default fallback → rejectUnauthorized=false')
  return { rejectUnauthorized: false }
})()

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
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
      connectionTimeoutMillis: 5000,
    },
    // Enable schema push in development to auto-sync DB when fields change
    push: process.env.NODE_ENV !== 'production',
  }),

  collections: [Pages, Posts, Media, Categories, Users],

  globals: [Header, Footer],

  cors: [serverURL, ...devOrigins].filter(Boolean),
  csrf: [serverURL, ...devOrigins].filter(Boolean),

  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        [Media.slug]: {
          generateURL: ({ filename }) => {
            // For Supabase storage, construct the public URL
            const baseUrl = process.env.S3_ENDPOINT?.replace('/s3', '') || ''
            return `${baseUrl}/object/public/${process.env.S3_BUCKET}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET as string,
      config: {
        endpoint: process.env.S3_ENDPOINT as string,
        region: process.env.S3_REGION || 'us-west-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
        },
        forcePathStyle: true,
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET,

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },

  onInit: async (payload) => {
    try {
      const dbURL = process.env.DATABASE_URL || ''
      let dbHost = 'unset'
      let sslFromUrl: string | undefined
      try {
        if (dbURL.includes('@')) {
          const hostMatch = dbURL.split('@')[1]?.split(/[/:?]/)[0]
          dbHost = hostMatch || 'unknown'
        }
        const q = dbURL.split('?')[1]
        if (q) sslFromUrl = new URLSearchParams(q).get('sslmode') || undefined
      } catch {}

      payload.logger.info(
        `[payload] init vercelEnv=${process.env.VERCEL_ENV || 'local'} hasDbUrl=${Boolean(
          dbURL,
        )} dbHost=${dbHost} sslFromEnv=${process.env.PGSSLMODE || 'unset'} sslFromUrl=${
          sslFromUrl || 'unset'
        }`,
      )

      payload.logger.info(`[payload] resolvedSSL=${JSON.stringify(resolvedSSL)}`)

      try {
        await payload.find({
          collection: 'pages',
          limit: 1,
          depth: 0,
          overrideAccess: true,
          pagination: false,
        })
        payload.logger.info('[payload] DB connectivity: OK')
      } catch (err) {
        payload.logger.error('[payload] DB connectivity failed', err as Error)
      }
    } catch (e) {
      console.error('[payload] init diagnostics error', e)
    }
  },
})
