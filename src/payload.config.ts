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

// --- Vercel/Netlify: serverURL should be dynamic and use env vars if possible ---
const serverURL =
  getServerSideURL() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.VERCEL_URL ||
  'http://localhost:3000'

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
      connectionString: process.env.DATABASE_URI || '',
    },
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

  cors: [serverURL].filter(Boolean),

  globals: [Header, Footer],

  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        [Media.slug]: {
          clientUploads: true, // Enable client-side uploads for Vercel
          // Optional: Add a 'prefix' here if your files are stored in a subfolder within your S3 bucket.
          // For example, if your files are in 'my-bucket/uploads/media/', you'd use:
          // prefix: 'uploads/media',
          // If files are directly in the bucket root (e.g., 'my-bucket/image.jpg'), you don't need a prefix.
        },
      },
      bucket: process.env.S3_BUCKET as string,
      config: {
        // This is the corrected line to use your full S3_ENDPOINT from .env
        endpoint: process.env.S3_ENDPOINT as string,
        // Ensure this region matches your Supabase project's region
        region: process.env.S3_REGION || 'us-west-1', // Default to us-west-1 if not specified
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
        },
        // IMPORTANT for Supabase Storage to work correctly (path-style addressing):
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
})
