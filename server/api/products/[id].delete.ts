import { requireAdmin } from '../../utils/auth'
import { parseObjectId } from '../../utils/objectId'
import { productNotFound, productsCollection } from '../../utils/product'

defineRouteMeta({
  openAPI: {
    tags: ['Products'],
    summary: 'Delete a product',
    description: 'Admin only.',
    responses: {
      200: { description: 'Product deleted' },
      400: { description: 'Invalid id' },
      401: { description: 'Not logged in' },
      403: { description: 'Admin access required' },
      404: { description: 'Product not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const _id = parseObjectId(getRouterParam(event, 'id'))

  const products = await productsCollection()
  const result = await products.deleteOne({ _id })

  if (result.deletedCount === 0) {
    throw productNotFound()
  }

  return {
    success: true,
    message: 'Product deleted',
  }
})
