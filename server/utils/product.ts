import { z } from 'zod'
import type { ObjectId, WithId } from 'mongodb'
import { connectToDatabase } from './db'

// How a product is stored in MongoDB
export interface ProductDocument {
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

// Body for POST /api/products
export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).default(''),
  price: z.number().min(0),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.url().nullable().default(null),
})

// Body for PATCH /api/products/:id: same fields, all optional, but at least one
export const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.url().nullable(),
}).partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' },
)

export async function productsCollection() {
  const db = await connectToDatabase()
  return db.collection<ProductDocument>('products')
}

// Convert a MongoDB document to the shape the API returns (_id -> id)
export function toProduct({ _id, ...product }: WithId<ProductDocument>) {
  return { id: (_id as ObjectId).toString(), ...product }
}

export function productNotFound() {
  return createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  })
}
