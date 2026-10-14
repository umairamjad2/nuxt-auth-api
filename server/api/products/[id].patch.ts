import { requireAdmin } from '../../utils/auth'
import { parseObjectId } from '../../utils/objectId'
import { productNotFound, productsCollection, toProduct, updateProductSchema } from '../../utils/product'

defineRouteMeta({
  openAPI: {
    tags: ['Products'],
    summary: 'Update a product',
    description: 'Admin only. Send only the fields you want to change.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Running Shoes v2' },
              description: { type: 'string' },
              price: { type: 'number', example: 39.99 },
              stock: { type: 'integer', example: 10 },
              imageUrl: { type: 'string', format: 'uri', nullable: true },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Product updated' },
      400: { description: 'Invalid id or validation failed' },
      401: { description: 'Not logged in' },
      403: { description: 'Admin access required' },
      404: { description: 'Product not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const _id = parseObjectId(getRouterParam(event, 'id'))
  const changes = await readValidatedBody(event, updateProductSchema.parse)

  // $set only touches the fields that were sent; returnDocument: 'after'
  // gives back the product as it is after the update
  const products = await productsCollection()
  const product = await products.findOneAndUpdate(
    { _id },
    { $set: { ...changes, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )

  if (!product) {
    throw productNotFound()
  }

  return {
    success: true,
    message: 'Product updated',
    product: toProduct(product),
  }
})
