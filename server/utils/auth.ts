import { ObjectId } from 'mongodb'
import type { H3Event } from 'h3'
import { connectToDatabase } from './db'

export async function requireAdmin(event: H3Event) {
  const session = await requireUserSession(event)

  // Check the role in MongoDB, not just the session cookie. The cookie is only
  // written at login, so without this a demoted admin would keep admin access
  // until they log out, and a newly promoted admin would have to log in again.
  const db = await connectToDatabase()
  const user = ObjectId.isValid(session.user.id)
    ? await db.collection('users').findOne({ _id: new ObjectId(session.user.id) })
    : null

  if (user?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return session.user
}
