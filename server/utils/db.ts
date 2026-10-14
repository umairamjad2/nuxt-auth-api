import dns from 'node:dns'
import { MongoClient, type Db } from 'mongodb'

let client: MongoClient | undefined
let database: Db | undefined

export async function connectToDatabase(): Promise<Db> {
  if (database) {
    return database
  }

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    throw new Error('MongoDB URI is not configured')
  }

  // mongodb+srv:// needs an SRV DNS lookup. Node's resolver here points at
  // 127.0.0.1, which refuses SRV queries (querySrv ECONNREFUSED), so use public DNS.
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
  }

  client = new MongoClient(uri)
  await client.connect()

  database = client.db('nuxt_app')

  return database
}