import { connectToDatabase } from '../../utils/db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = await connectToDatabase()

  const users = await db.collection('users')
    .find({})
    .project({
      passwordHash: 0,
    })
    .toArray()

  return {
    success: true,
    count: users.length,
    users,
  }
})