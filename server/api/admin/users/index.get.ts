import { z } from 'zod'
import type { Document, Filter } from 'mongodb'
import { connectToDatabase } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { toPublicUser } from '../../../utils/user'

defineRouteMeta({
  openAPI: {
    tags: ['Admin'],
    summary: 'List users',
    description: 'Admin only. Search by name or email, filter by role, paginated. Newest first.',
    parameters: [
      { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Search name or email' },
      { name: 'role', in: 'query', required: false, schema: { type: 'string', enum: ['admin', 'user'] } },
      { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 20 }, description: '1-100' },
    ],
    responses: {
      200: { description: 'A page of users (never includes password hashes)' },
      400: { description: 'Invalid query parameters' },
      401: { description: 'Not logged in' },
      403: { description: 'Admin access required' },
    },
  },
})

const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(['admin', 'user']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { search, role, page, limit } = await getValidatedQuery(event, querySchema.parse)

  const filter: Filter<Document> = {}

  if (search) {
    const pattern = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    filter.$or = [{ name: pattern }, { email: pattern }]
  }

  // Users registered before roles existed have no role field; count them as "user"
  if (role === 'admin') {
    filter.role = 'admin'
  } else if (role === 'user') {
    filter.role = { $ne: 'admin' }
  }

  const db = await connectToDatabase()
  const users = db.collection('users')

  const [items, total] = await Promise.all([
    users.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    users.countDocuments(filter),
  ])

  return {
    success: true,
    users: items.map(toPublicUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
