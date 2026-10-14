/// <reference types="node" />
// Promote a registered user to admin.
// Usage: npm run make-admin -- user@example.com
//
// Runs outside Nuxt, so it can't use server/utils/db.ts (that needs useRuntimeConfig).
// It reads NUXT_MONGODB_URI from .env instead (loaded by node --env-file).
import dns from 'node:dns'
import { MongoClient } from 'mongodb'

const email = process.argv[2]?.trim().toLowerCase()
const uri = process.env.NUXT_MONGODB_URI

if (!email) {
  console.error('Usage: npm run make-admin -- user@example.com')
  process.exit(1)
}

if (!uri) {
  console.error('NUXT_MONGODB_URI is not set in .env')
  process.exit(1)
}

// Same DNS workaround as server/utils/db.ts (querySrv ECONNREFUSED)
if (uri.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
}

const client = new MongoClient(uri)

try {
  await client.connect()

  const result = await client.db('nuxt_app').collection('users').updateOne(
    { email },
    { $set: { role: 'admin' } },
  )

  if (result.matchedCount === 0) {
    console.log(`User not found: ${email}. Register this email first.`)
    process.exitCode = 1
  } else if (result.modifiedCount === 0) {
    console.log(`${email} is already an admin.`)
  } else {
    console.log(`${email} promoted to admin. Log in again to get the admin session.`)
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await client.close()
}
