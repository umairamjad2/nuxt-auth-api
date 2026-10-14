import { z } from 'zod'
import type { Filter } from 'mongodb'
import { productsCollection, toProduct, type ProductDocument } from '../../utils/product'

defineRouteMeta({
  openAPI: {
    tags: ['Products'],
    summary: 'List products',
    description: 'Public. Supports search by name and pagination. Newest products first.',
    parameters: [
      { name: 'search', in: 'query', required: false, schema: { type: 'string' }, description: 'Search product names' },
      { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10 }, description: '1-50' },
    ],
    responses: {
      200: { description: 'A page of products' },
      400: { description: 'Invalid query parameters' },
    },
  },
})

// Query strings are always text, so z.coerce turns "2" into 2
const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export default defineEventHandler(async (event) => {
  const { search, page, limit } = await getValidatedQuery(event, querySchema.parse)

  // Case-insensitive "name contains search". Special regex characters are escaped
  // so a search like "c++" is treated as plain text.
  const filter: Filter<ProductDocument> = search
    ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
    : {}

  const products = await productsCollection()

  const [items, total] = await Promise.all([
    products.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    products.countDocuments(filter),
  ])

  return {
    success: true,
    products: items.map(toProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
