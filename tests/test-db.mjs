import { Client } from 'pg'
import 'dotenv/config'

const ssl =
  process.env.PGSSLMODE === 'no-verify'
    ? { rejectUnauthorized: false }
    : process.env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false } // default dev

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl,
})

await client.connect()
const res = await client.query('select now()')
console.log('✅ DB connected!', res.rows[0])
await client.end()
