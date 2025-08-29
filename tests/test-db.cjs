import { Client } from 'pg'
import 'dotenv/config'

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'no-verify' ? { rejectUnauthorized: false } : undefined,
})

async function main() {
  try {
    await client.connect()
    const res = await client.query('SELECT NOW()')
    console.log('✅ DB connected!', res.rows[0])
  } catch (err) {
    console.error('❌ DB connection failed:', err)
  } finally {
    await client.end()
  }
}

await main()
