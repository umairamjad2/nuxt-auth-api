import { requireAdmin } from '../../utils/auth'
import { createProductSchema, productsCollection, toProduct } from '../../utils/product'

defineRouteMeta({
  openAPI: {
    tags: ['Products'],
    summary: 'Create a product',
    description: 'Admin only.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'price'],
            properties: {
              name: { type: 'string', description: '2-120 characters', example: 'Running Shoes' },
              description: { type: 'string', description: 'Up to 2000 characters', example: 'Lightweight shoes for daily runs' },
              price: { type: 'number', description: '0 or more', example: 49.99 },
              stock: { type: 'integer', description: '0 or more, default 0', example: 25 },
              imageUrl: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/shoes.jpg' },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Product created' },
      400: { description: 'Validation failed' },
      401: { description: 'Not logged in' },
      403: { description: 'Admin access required' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // 1. Only admins can create products
  await requireAdmin(event)

  // 2. Validate the body (fills in defaults for description, stock, imageUrl)
  const data = await readValidatedBody(event, createProductSchema.parse)

  // 3. Save it with timestamps
  const now = new Date()
  const product = { ...data, createdAt: now, updatedAt: now }

  const products = await productsCollection()
  const result = await products.insertOne(product)

  // 4. 201 = "Created"
  setResponseStatus(event, 201)

  return {
    success: true,
    message: 'Product created',
    product: toProduct({ _id: result.insertedId, ...product }),
  }
})
