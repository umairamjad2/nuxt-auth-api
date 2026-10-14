import { parseObjectId } from '../../utils/objectId'
import { productNotFound, productsCollection, toProduct } from '../../utils/product'

defineRouteMeta({
  openAPI: {
    tags: ['Products'],
    summary: 'Get one product',
    description: 'Public.',
    responses: {
      200: { description: 'The product' },
      400: { description: 'Invalid id' },
      404: { description: 'Product not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // [id] in the file name becomes the :id route parameter
  const _id = parseObjectId(getRouterParam(event, 'id'))

  const products = await productsCollection()
  const product = await products.findOne({ _id })

  if (!product) {
    throw productNotFound()
  }

  return {
    success: true,
    product: toProduct(product),
  }
})
