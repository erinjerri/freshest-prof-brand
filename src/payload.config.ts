import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
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

const serverURL =
  getServerSideURL() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.VERCEL_URL ||
  'http://localhost:3000'

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
      ssl: resolvedSSL,
    },
    push: false,
  }),

  collections: [
    Pages,
    Posts,
    {
      ...Media,
      upload:
        Media.upload && typeof Media.upload === 'object'
          ? { ...Media.upload, staticDir: 'media' }
          : { staticDir: 'media' },
    },
    Categories,
    Users,
  ],

  globals: [Header, Footer],

  cors: [serverURL].filter(Boolean),

  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        [Media.slug]: {},
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
