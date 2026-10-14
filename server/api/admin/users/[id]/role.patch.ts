import { z } from 'zod'
import { connectToDatabase } from '../../../../utils/db'
import { requireAdmin } from '../../../../utils/auth'
import { parseObjectId } from '../../../../utils/objectId'
import { toPublicUser } from '../../../../utils/user'

defineRouteMeta({
  openAPI: {
    tags: ['Admin'],
    summary: 'Change a user\'s role',
    description: 'Admin only. Promote a user to admin or demote an admin to user. You cannot change your own role. Takes effect immediately.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['role'],
            properties: {
              role: { type: 'string', enum: ['admin', 'user'], example: 'admin' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Role updated (or already had that role)' },
      400: { description: 'Invalid id, invalid role, or trying to change your own role' },
      401: { description: 'Not logged in' },
      403: { description: 'Admin access required' },
      404: { description: 'User not found' },
    },
  },
})

const bodySchema = z.object({
  role: z.enum(['admin', 'user']),
})

export default defineEventHandler(async (event) => {
  // 1. Only admins can change roles
  const admin = await requireAdmin(event)

  // 2. Validate the id from the URL and the new role from the body
  const _id = parseObjectId(getRouterParam(event, 'id'))
  const { role } = await readValidatedBody(event, bodySchema.parse)

  // 3. Don't let an admin change their own role. This stops someone from
  //    accidentally removing the last admin and locking everyone out.
  if (_id.toString() === admin.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot change your own role',
    })
  }

  // 4. Update and return the user as it is after the change
  const db = await connectToDatabase()
  const user = await db.collection('users').findOneAndUpdate(
    { _id },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  return {
    success: true,
    message: role === 'admin' ? 'User promoted to admin' : 'User changed to regular user',
    user: toPublicUser(user),
  }
})
